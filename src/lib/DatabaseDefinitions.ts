export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      lunch_proposal_vote: {
        Row: {
          upvote: boolean;
          id: string;
          created_at: string;
          user_id: string;
          family_id: string;
          lunch_proposal_id: string;
          lunch_id: string | null;
        };
        Insert: {
          upvote: boolean;
          id?: string;
          created_at?: string;
          user_id: string;
          family_id: string;
          lunch_proposal_id: string;
          lunch_id?: string | null;
        };
        Update: {
          upvote?: boolean;
          id?: string;
          created_at?: string;
          user_id?: string;
          family_id?: string;
          lunch_proposal_id?: string;
          lunch_id?: string | null;
        };
      };
      users_to_families: {
        Row: {
          options: Json | null;
          user_id: string;
          name: string | null;
          families_id: string | null;
        };
        Insert: {
          options?: Json | null;
          user_id: string;
          name?: string | null;
          families_id?: string | null;
        };
        Update: {
          options?: Json | null;
          user_id?: string;
          name?: string | null;
          families_id?: string | null;
        };
      };
      lunch_proposal: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          lunch_id: string;
          family_id: string;
          meal_type: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          lunch_id: string;
          family_id: string;
          meal_type: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          lunch_id?: string;
          family_id?: string;
          meal_type?: string;
        };
      };
      lunchs: {
        Row: {
          lunch_date: string;
          description: string | null;
          lunch_type: string;
          selected_lunch_proposal_id: string | null;
          id: string;
          created_by: string;
          family_id: string;
          cook_id: string | null;
          created_at: string;
        };
        Insert: {
          lunch_date: string;
          description?: string | null;
          lunch_type?: string;
          selected_lunch_proposal_id?: string | null;
          id?: string;
          created_by: string;
          family_id: string;
          cook_id?: string | null;
          created_at?: string;
        };
        Update: {
          lunch_date?: string;
          description?: string | null;
          lunch_type?: string;
          selected_lunch_proposal_id?: string | null;
          id?: string;
          created_by?: string;
          family_id?: string;
          cook_id?: string | null;
          created_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          created_at: string | null;
          lunch_id: string;
          family_id: string;
          name: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          lunch_id: string;
          family_id: string;
          name: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          lunch_id?: string;
          family_id?: string;
          name?: string;
          created_by?: string | null;
        };
      };
      lunch_proposal_comments: {
        Row: {
          id: string;
          created_at: string;
          family_id: string;
          user_id: string;
          text: string;
          lunch_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          family_id: string;
          user_id: string;
          text: string;
          lunch_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          family_id?: string;
          user_id?: string;
          text?: string;
          lunch_id?: string;
        };
      };
      lunch_members: {
        Row: {
          family_id: string | null;
          lunch_id: string | null;
          user_id: string | null;
          username: string | null;
          id: string;
          StartTime: string | null;
          EndTime: string | null;
          created_at: string | null;
          meal_type: string | null;
        };
        Insert: {
          family_id?: string | null;
          lunch_id?: string | null;
          user_id?: string | null;
          username?: string | null;
          id?: string;
          StartTime?: string | null;
          EndTime?: string | null;
          created_at?: string | null;
          meal_type?: string | null;
        };
        Update: {
          family_id?: string | null;
          lunch_id?: string | null;
          user_id?: string | null;
          username?: string | null;
          id?: string;
          StartTime?: string | null;
          EndTime?: string | null;
          created_at?: string | null;
          meal_type?: string | null;
        };
      };
      families: {
        Row: {
          id: string;
          created_at: string | null;
          creator_id: string;
          name: string;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          creator_id: string;
          name: string;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          creator_id?: string;
          name?: string;
        };
      };
    };
    Functions: {};
  };
}

