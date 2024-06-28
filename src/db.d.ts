export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      missing_word_report: {
        Row: {
          created_at: string | null
          id: number
          room_id: string | null
          user_id: string | null
          word: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          room_id?: string | null
          user_id?: string | null
          word?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          room_id?: string | null
          user_id?: string | null
          word?: string | null
        }
      }
      puzzles: {
        Row: {
          answers: string[]
          id: string
          name: string
          total_score: number
        }
        Insert: {
          answers: string[]
          id?: string
          name: string
          total_score: number
        }
        Update: {
          answers?: string[]
          id?: string
          name?: string
          total_score?: number
        }
      }
      rooms: {
        Row: {
          created_at: string | null
          guessed_answers: string[] | null
          host_user_id: string | null
          id: string
          puzzle_id: string | null
          room_code: string
          score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guessed_answers?: string[] | null
          host_user_id?: string | null
          id?: string
          puzzle_id?: string | null
          room_code?: string
          score?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guessed_answers?: string[] | null
          host_user_id?: string | null
          id?: string
          puzzle_id?: string | null
          room_code?: string
          score?: number
          updated_at?: string | null
        }
      }
      user_participation: {
        Row: {
          answers: string[] | null
          created_at: string | null
          room_id: string
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: string[] | null
          created_at?: string | null
          room_id: string
          score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: string[] | null
          created_at?: string | null
          room_id?: string
          score?: number
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      room_with_puzzle: {
        Row: {
          answer_count: number | null
          created_at: string | null
          guessed_answers: string[] | null
          host_user_id: string | null
          id: string | null
          puzzle: string | null
          puzzle_id: string | null
          room_code: string | null
          score: number | null
          total_score: number | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      insert_answer: {
        Args: {
          p_answer: string
          p_room_code: string
        }
        Returns: number
      }
      add_words_and_update_score: {
        Args: {
          words: string[]
        }
        Returns: undefined
      }
      add_words_pls: {
        Args: {
          words: string[]
        }
        Returns: {
          puzzle_name: string
          added_answers: string[]
        }[]
      }
      add_words_test: {
        Args: {
          words: string[]
        }
        Returns: {
          name: string
        }[]
      }
      backfill_puzzles_answers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      backfill_total_answer_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      backfill_total_score: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_updated_score: {
        Args: {
          p_answers: string[]
        }
        Returns: number
      }
      create_room: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_old_empty_rooms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gen_room: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_room: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      join_room_by_code: {
        Args: {
          input_room_code: string
        }
        Returns: string
      }
      purge_words: {
        Args: {
          words_to_remove: string[]
        }
        Returns: undefined
      }
      purge_words_and_update_score:
      | {
        Args: {
          words_to_remove: string[]
        }
        Returns: undefined
      }
      | {
        Args: {
          word_to_remove: string
        }
        Returns: undefined
      }
      random_puzzle: {
        Args: {
          min_answers: number
        }
        Returns: string
      }
      random_puzzle_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      random_puzzle_uuid: {
        Args: {
          min_length?: number
          max_length?: number
        }
        Returns: string
      }
      score_answer: {
        Args: {
          p_room_code: string
          p_answer: string
        }
        Returns: number
      }
      score_word: {
        Args: {
          word: string
          puzzle_name: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
