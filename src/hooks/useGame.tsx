import { useEffect, useState } from 'react'
import { DbView, DbRow, useSupabase } from '../contexts/supabase'
import { toast } from 'react-hot-toast'
import { useMap } from 'usehooks-ts'
import { Link } from 'wouter'

type GameUser = Pick<DbRow<'user_participation'>, 'score' | 'answers'>


// messages to display the user when they submit a guess
const MSG = {
  missingWordSuccess: 'Missing word reported. TY!',
  missingWordError: 'Error reporting missing word',
  minLength: 'Guess must be at least 4 letters',
  requiredLetter: 'Guess must contain the required letter',
  error: 'Error scoring guess',
  notFound: 'No matching answers',
  alreadyGuessed: 'Someone already guessed that',
  correct: ['Correct!', 'Nice!', 'Great!', 'Awesome!', 'Amazing!', 'You got it!', 'Way to go!', 'Nailed it!', 'Got one!', 'Ayyyy!', 'Let\s go!'],
}


export default function useGame(roomCode: string) {
  const { client: supabase, user, username, setUsername } = useSupabase()
  const [game, setGame] = useState<DbView<'room_with_puzzle'> | null>(null)
  const [guess, setGuess] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [users, userActions] = useMap<string, GameUser>([])
  const [usernames, usernameActions] = useMap<string, string>([])

  const clearGuess = () => { setGuess('') }
  const removeLetter = () => { setGuess(p => p.slice(0, -1)) }
  const addLetter = (letter: string) => {
    setGuess((prevGuess) => prevGuess + letter)
    setHasStarted(true)
  }
  const updateGame = (data: DbRow<'rooms'>) => {
    if (!game) return
    const { puzzle, total_score, answer_count } = game
    setGame({ ...data, puzzle, total_score, answer_count })
  }

  const submitGuess = async () => {
    if (!game?.puzzle) return 0
    let score = 0
    const g = guess.toLocaleLowerCase()
    const r = game.puzzle[0].toLocaleLowerCase()
    const guessed = game?.guessed_answers
    if (guess.length < 4) toast.error(MSG.minLength)
    else if (r && !g.includes(r)) toast.error(MSG.requiredLetter)
    else if (guessed?.includes(g)) toast.error(MSG.alreadyGuessed)
    else {
      const payload = { p_answer: g, p_room_code: roomCode }
      const { data } = await supabase.rpc('insert_answer', payload)
      if (!!data) {
        score = data
        const msg = MSG.correct[Math.floor(Math.random() * MSG.correct.length)]
        toast.success(`${score} points! ${msg}`)
        const payload = { score, username, word: g }
        supabase
          .channel(`misc.${game?.id}`)
          .subscribe()
          .send({ type: 'broadcast', event: 'guessed_answer', payload })
      } else toast.error(<>
        {MSG.notFound}
        <br />
        <Link
          href="#"
          onClick={async () => {
            const { error } = await supabase
              .from('missing_word_report')
              .insert({ word: g, user_id: user!.id, room_id: game!.id })
            error ? toast.error(MSG.missingWordError) : toast(MSG.missingWordSuccess)
          }}
        >
          Report missing word <b>`{g}`</b>
        </Link>
      </>)
    }
    clearGuess()
    return score
  }

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data: id } = await supabase.rpc('join_room_by_code', { input_room_code: roomCode })
        if (!id) throw new Error('Room not found')

        const r = await supabase
          .from('room_with_puzzle')
          .select('*')
          .eq('id', id)
          .single()

        if (!r.error) {
          setGame(r.data)
          const { data } = await supabase
            .from('user_participation')
            .select('user_id, score, answers')
            .eq('room_id', id)
          if (!data) throw new Error('No users found')
          userActions.setAll(data.map(({ user_id, score, answers }) => [
            user_id,
            { score, answers }
          ]))
        }
      } catch (e) { console.error(`Error fetching room: ${e}`) }
    }
    if (user?.id) fetchRoom()
  }, [roomCode, user])

  useEffect(() => {
    if (!game?.id) return

    const roomChannel = supabase
      .channel(`room_changes.${game.id}`)
      .on<DbRow<'rooms'>>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${game.id}`
        },
        p => { updateGame(p.new) }
      )
      .subscribe()
    const scoresChannel = supabase
      .channel(`user_participation.${game.id}`)
      .on<DbRow<'user_participation'>>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_participation',
          filter: `room_id=eq.${game.id}`
        },
        () => { toast.success(`A new user joined the game!`) }
      )
      .on<DbRow<'user_participation'>>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_participation',
          filter: `room_id=eq.${game.id}`
        },
        ({ new: { user_id, answers, score } }) => {
          userActions.set(user_id, { answers, score })
        })
      .subscribe()
    const guessedAnswersChannel = supabase.channel(`misc.${game.id}`)
    guessedAnswersChannel.on('broadcast', { event: 'guessed_answer' }, ({ payload }) => {
      console.log(payload)
      if (payload.score) toast.success(`${payload.username || 'Someone'} guessed "${payload.word}"!`, { position: 'top-center' })
    }).subscribe()
    const userChannel = supabase.channel(`user${game.id}`)
    userChannel
      .on('presence', { event: 'sync' }, () => {
        const presence = userChannel.presenceState<{ user: string, username: string }>()
        usernameActions.setAll(
          Object.values(presence)
            .map(([{ user, username }]) => [user, username])
        )
      }).subscribe((status) => {
        console.log(status)
        if (status === 'SUBSCRIBED') {
          userChannel.track({
            user: user?.id,
            username,
          })
        }
      })
    return () => {
      roomChannel.unsubscribe()
      scoresChannel.unsubscribe()
      guessedAnswersChannel.unsubscribe()
      userChannel.unsubscribe()
    }
  }, [game?.id])

  useEffect(() => {
    if (!game?.puzzle) return
    const handleKeyDown = ({ key }: KeyboardEvent) => {
      if (!game.puzzle) return
      if (new RegExp(key, 'i').test(game.puzzle)) addLetter(key)
      else if (key === 'Backspace') removeLetter()
      else if (key === 'Enter') submitGuess()
      else return
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [game, guess])

  return {
    game,
    guess,
    addLetter,
    submitGuess,
    clearGuess,
    removeLetter,
    hasStarted,
    users,
    usernames,
    username,
    setUsername,
    myId: user?.id
  }
}

