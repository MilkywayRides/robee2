export interface Block {
  id: string;
  type: string;
  content: string;
  data?: Record<string, any>;
}

export type BlockType = 
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'list'
  | 'orderedList'
  | 'quote'
  | 'code'
  | 'image'
  | 'link'; 