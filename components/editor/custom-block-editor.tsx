"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Undo,
  Redo,
  Plus,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Block, BlockType } from "@/types/editor"

interface CustomBlockEditorProps {
  initialContent: Block[]
  onChange: (blocks: Block[]) => void
  readOnly?: boolean
}

export function CustomBlockEditor({ 
  initialContent, 
  onChange,
  readOnly = false 
}: CustomBlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialContent)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [history, setHistory] = useState<Block[][]>([blocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleBlockChange = useCallback((updatedBlock: Block) => {
    const newBlocks = blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    )
    setBlocks(newBlocks)
    setHistory([...history.slice(0, historyIndex + 1), newBlocks])
    setHistoryIndex(historyIndex + 1)
    onChange(newBlocks)
  }, [blocks, history, historyIndex, onChange])

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: '',
      data: {}
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    setHistory([...history.slice(0, historyIndex + 1), newBlocks])
    setHistoryIndex(historyIndex + 1)
    onChange(newBlocks)
  }, [blocks, history, historyIndex, onChange])

  const handleDeleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId)
    setBlocks(newBlocks)
    setHistory([...history.slice(0, historyIndex + 1), newBlocks])
    setHistoryIndex(historyIndex + 1)
    onChange(newBlocks)
  }, [blocks, history, historyIndex, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const index = blocks.findIndex(b => b.id === blockId)
      handleAddBlock('paragraph')
    } else if (e.key === 'Backspace' && blocks.find(b => b.id === blockId)?.content === '') {
      e.preventDefault()
      handleDeleteBlock(blockId)
    }
  }, [blocks, handleAddBlock, handleDeleteBlock])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(history[historyIndex - 1])
      onChange(history[historyIndex - 1])
    }
  }, [history, historyIndex, onChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(history[historyIndex + 1])
      onChange(history[historyIndex + 1])
    }
  }, [history, historyIndex, onChange])

  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleBlockChange({ ...block, content: e.target.value }),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      onFocus: () => setSelectedBlock(block.id),
      onBlur: () => setSelectedBlock(null),
      readOnly,
      className: cn(
        "w-full bg-transparent outline-none resize-none",
        block.type === 'heading1' && "text-4xl font-bold",
        block.type === 'heading2' && "text-3xl font-bold",
        block.type === 'heading3' && "text-2xl font-bold",
        block.type === 'quote' && "italic border-l-4 border-gray-300 pl-4",
        block.type === 'code' && "font-mono bg-gray-100 p-2 rounded"
      )
    }

    switch (block.type) {
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <Input {...commonProps} />
      case 'list':
      case 'orderedList':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2">{block.type === 'orderedList' ? '1.' : '•'}</span>
            <Input {...commonProps} />
          </div>
        )
      case 'image':
        return (
          <div className="space-y-2">
            <Input 
              {...commonProps}
              placeholder="Enter image URL"
              value={block.data?.url || ''}
              onChange={(e) => handleBlockChange({ ...block, data: { ...block.data, url: e.target.value } })}
            />
            <Input
              placeholder="Image caption"
              value={block.data?.caption || ''}
              onChange={(e) => handleBlockChange({ ...block, data: { ...block.data, caption: e.target.value } })}
            />
            {block.data?.url && (
              <img 
                src={block.data.url} 
                alt={block.data.caption || ''} 
                className="max-w-full h-auto rounded-lg"
              />
            )}
          </div>
        )
      case 'link':
        return (
          <div className="space-y-2">
            <Input 
              {...commonProps}
              placeholder="Enter link text"
            />
            <Input
              placeholder="Enter URL"
              value={block.data?.url || ''}
              onChange={(e) => handleBlockChange({ ...block, data: { ...block.data, url: e.target.value } })}
            />
          </div>
        )
      default:
        return <Textarea {...commonProps} />
    }
  }

  return (
    <div className="space-y-4" ref={editorRef}>
      {!readOnly && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-background">
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, data: { ...blocks.find(b => b.id === selectedBlock)!.data, style: { bold: true } } })}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, data: { ...blocks.find(b => b.id === selectedBlock)!.data, style: { italic: true } } })}>
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'heading1' })}>
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'heading2' })}>
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'heading3' })}>
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'list' })}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'orderedList' })}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'quote' })}>
            <Quote className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'code' })}>
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'image' })}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectedBlock && handleBlockChange({ ...blocks.find(b => b.id === selectedBlock)!, type: 'link' })}>
            <Link className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            {renderBlock(block)}
            {!readOnly && selectedBlock === block.id && (
              <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddBlock('paragraph')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!readOnly && (
              <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  aria-label="Delete block"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 