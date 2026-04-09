import { useMemo } from 'react'
import { useFiles } from '../context/FileContext'
import type { SearchResult } from '../types'

export function useSearch(): SearchResult[] {
  const { files, searchQuery } = useFiles()

  return useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    for (const [, file] of files) {
      const contentLower = file.content.toLowerCase()
      let matchCount = 0
      let idx = 0
      while ((idx = contentLower.indexOf(query, idx)) !== -1) {
        matchCount++
        idx += query.length
      }

      if (matchCount > 0 || file.name.toLowerCase().includes(query)) {
        results.push({
          fileId: file.id,
          fileName: file.name,
          matchCount,
        })
      }
    }

    return results.sort((a, b) => b.matchCount - a.matchCount)
  }, [files, searchQuery])
}
