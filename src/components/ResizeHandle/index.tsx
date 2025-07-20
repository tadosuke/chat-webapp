import './ResizeHandle.css'

interface ResizeHandleProps {
  onMouseDown: (event: React.MouseEvent) => void
}

/**
 * サイドバーのリサイズハンドルコンポーネント
 * マウスドラッグでサイドバーのサイズを調整するためのUI要素
 * @param onMouseDown - マウス押下時のイベントハンドラー
 * @returns リサイズハンドルのJSX要素
 */
function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div 
      className="resize-handle"
      onMouseDown={onMouseDown}
      role="separator"
      aria-label="サイドバーのサイズを調整"
    />
  )
}

export default ResizeHandle
export type { ResizeHandleProps }