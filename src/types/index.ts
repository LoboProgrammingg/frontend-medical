/**
 * Tipos TypeScript para dados da API
 */

// User
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Note
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface NoteListResponse {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// RAG
export interface SemanticSearchRequest {
  query: string;
  top_k?: number;
}

export interface SemanticSearchResult {
  note_id: string;
  title: string;
  content: string;
  similarity_score: number;
  tags: string[];
}

export interface AskRequest {
  question: string;
  top_k?: number;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: SemanticSearchResult[];
  model_used: string;
}

// Agents
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MedicalAssistantRequest {
  message: string;
  conversation_id?: string;
  conversation_history?: ChatMessage[];
}

export interface MedicalAssistantResponse {
  response: string;
  sources_used: string[];
}

export interface NoteAnalysisRequest {
  note_id: string;
}

export interface NoteAnalysisResponse {
  note_id: string;
  analysis: string;
  suggestions: string[];
  quality_score: number;
}

export interface CalendarRequest {
  calendar_text: string;
}

// Calendar Types (updated to match backend)
export interface CalendarEvent {
  id: string;
  event_type: 'work' | 'on_call';
  event_date: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  shift_type?: string;
  notes?: string;
  preceptor?: string;
  week_number?: number;
}

export interface Calendar {
  id: string;
  title: string;
  description?: string;
  group_number?: number;
  name_in_calendar?: string;
  position_in_list?: string;
  start_date: string;
  end_date: string;
  source_file?: string;
  events: CalendarEvent[];
  created_at: string;
  updated_at: string;
}

export interface CalendarListResponse {
  calendars: Calendar[];
  total: number;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  summary: {
    total_days: number;
    regular_days: number;
    on_call_days: number;
  };
}

// Conversations
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  page_size: number;
}

// Gems
export interface GemDocument {
  id: string;
  filename: string;
  file_size: number;
  created_at: string;
}

export interface Gem {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  documents: GemDocument[];
  created_at: string;
  updated_at: string;
}

export interface GemListResponse {
  gems: Gem[];
  total: number;
}

export interface GemCreateRequest {
  name: string;
  description?: string;
  instructions: string;
}

export interface GemUpdateRequest {
  name?: string;
  description?: string;
  instructions?: string;
}

export interface GemChatRequest {
  message: string;
  gem_id: string;
}

export interface GemChatResponse {
  response: string;
  gem_id: string;
  gem_name: string;
  sources_used: string[];
}

