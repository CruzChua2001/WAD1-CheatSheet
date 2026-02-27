import { useState, useMemo } from 'react'
import { cheatSheetData } from './data'

// Main categories for drill-down
const MAIN_CATEGORIES = [
  { id: null, label: 'All' },
  { id: 'JavaScript', label: 'JavaScript' },
  { id: 'HTML', label: 'HTML' },
  { id: 'Node & Express', label: 'Node & Express' },
  { id: 'EJS', label: 'EJS' },
]

// Subcategories per main category (for JS and Node & Express)
const JS_SUBCATEGORIES = [
  { id: 'JS Types & Quirks', label: 'Types & Quirks' },
  { id: 'JS Variables', label: 'Variables' },
  { id: 'JS Arrays & Strings', label: 'Arrays & Strings' },
  { id: 'JS Loops', label: 'Loops' },
  { id: 'JS Regex & Character', label: 'Regex & Character' },
  { id: 'Math & Number', label: 'Math & Number' },
  { id: 'Algorithm', label: 'Algorithm' },
]
const NODE_SUBCATEGORIES = [
  { id: 'Node.js & Modules', label: 'Node.js & Modules' },
  { id: 'Express.js', label: 'Express.js' },
]
const EJS_SUBCATEGORIES = [{ id: 'EJS Templating', label: 'EJS Templating' }]

function useHtmlTags() {
  return useMemo(() => {
    const tags = [...new Set(cheatSheetData.filter((i) => i.tag && i.category === 'HTML').map((i) => i.tag))]
    return tags.map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))
  }, [])
}

function useAlgorithmTypes() {
  return useMemo(() => {
    const types = [...new Set(cheatSheetData.filter((i) => i.category === 'Algorithm' && i.algorithmType).map((i) => i.algorithmType))]
    return types.sort().map((id) => ({ id, label: id }))
  }, [])
}

function fuzzyMatch(text, query) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const t = String(text ?? '').toLowerCase()
  return t.includes(q)
}

function filterData(data, query, mainCategory, subcategoryOrTag, algorithmTypeFilter) {
  let filtered = data

  // Filter by main category and subcategory/tag
  if (mainCategory === 'JavaScript' && subcategoryOrTag) {
    filtered = filtered.filter((item) => item.category === subcategoryOrTag)
    // When Algorithm is selected, further filter by algorithm type if chosen
    if (subcategoryOrTag === 'Algorithm' && algorithmTypeFilter) {
      filtered = filtered.filter((item) => item.algorithmType === algorithmTypeFilter)
    }
  } else if (mainCategory === 'JavaScript') {
    filtered = filtered.filter((item) =>
      ['JS Types & Quirks', 'JS Variables', 'JS Arrays & Strings', 'JS Loops', 'JS Regex & Character', 'Math & Number', 'Algorithm'].includes(item.category)
    )
  } else if (mainCategory === 'HTML' && subcategoryOrTag) {
    filtered = filtered.filter((item) => item.category === 'HTML' && item.tag === subcategoryOrTag)
  } else if (mainCategory === 'HTML') {
    filtered = filtered.filter((item) => item.category === 'HTML')
  } else if (mainCategory === 'Node & Express' && subcategoryOrTag) {
    filtered = filtered.filter((item) => item.category === subcategoryOrTag)
  } else if (mainCategory === 'Node & Express') {
    filtered = filtered.filter((item) =>
      ['Node.js & Modules', 'Express.js'].includes(item.category)
    )
  } else if (mainCategory === 'EJS') {
    filtered = filtered.filter((item) => item.category === 'EJS Templating')
  }

  // Then apply search
  if (query.trim()) {
    filtered = filtered.filter(
      (item) =>
        fuzzyMatch(item.category, query) ||
        fuzzyMatch(item.item, query) ||
        fuzzyMatch(item.syntax, query) ||
        fuzzyMatch(item.description, query) ||
        fuzzyMatch(item.returnType, query) ||
        fuzzyMatch(item.details, query) ||
        fuzzyMatch(item.tag, query)
    )
  }

  return filtered
}

function Card({ item }) {
  return (
    <article className="card">
      <div className="card-header">
        <span className="category">{item.category}</span>
        {(item.tag || (item.category === 'Algorithm' && item.algorithmType)) && (
          <span className="tag">{item.tag || item.algorithmType}</span>
        )}
        <strong className="item">{item.item}</strong>
      </div>
      {item.syntax && (
        <pre className="syntax"><code>{item.syntax}</code></pre>
      )}
      {(item.returnType != null && item.returnType !== '' && item.returnType !== 'N/A') && (
        <div className="return-type">
          <span className="return-label">Type / Returns:</span>{' '}
          <strong>{item.returnType}</strong>
        </div>
      )}
      <p className="description">{item.description}</p>
      {item.details && <p className="details">{item.details}</p>}
    </article>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [mainCategory, setMainCategory] = useState(null)
  const [subcategoryOrTag, setSubcategoryOrTag] = useState(null)
  const [algorithmTypeFilter, setAlgorithmTypeFilter] = useState(null)

  const htmlTags = useHtmlTags()
  const algorithmTypes = useAlgorithmTypes()

  const results = useMemo(
    () => filterData(cheatSheetData, query, mainCategory, subcategoryOrTag, algorithmTypeFilter),
    [query, mainCategory, subcategoryOrTag, algorithmTypeFilter]
  )

  const showSubcategories = mainCategory === 'JavaScript' && JS_SUBCATEGORIES.length
  const showHtmlTags = mainCategory === 'HTML' && htmlTags.length
  const showNodeSubcategories = mainCategory === 'Node & Express' && NODE_SUBCATEGORIES.length
  const showEjsSubcategories = mainCategory === 'EJS' && EJS_SUBCATEGORIES.length
  const showAlgorithmTypes = mainCategory === 'JavaScript' && subcategoryOrTag === 'Algorithm' && algorithmTypes.length > 0

  const handleMainCategory = (id) => {
    setMainCategory(id)
    setSubcategoryOrTag(null)
    setAlgorithmTypeFilter(null)
  }

  const handleSubcategory = (id) => {
    setSubcategoryOrTag(subcategoryOrTag === id ? null : id)
    if (id !== 'Algorithm') setAlgorithmTypeFilter(null)
  }

  const handleAlgorithmType = (type) => {
    setAlgorithmTypeFilter(algorithmTypeFilter === type ? null : type)
  }

  return (
    <>
      <header className="header">
        <h1>Cheat Sheet Search</h1>
        <input
          type="search"
          className="search-input"
          placeholder="Search category, syntax, description, details..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <p className="result-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
      </header>

      <nav className="category-nav">
        <div className="main-categories">
          {MAIN_CATEGORIES.map((c) => (
            <button
              key={c.id ?? 'all'}
              type="button"
              className={`nav-btn ${mainCategory === c.id ? 'active' : ''}`}
              onClick={() => handleMainCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showSubcategories && (
          <div className="subcategories">
            <span className="sub-label">Data type:</span>
            {JS_SUBCATEGORIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`nav-btn sub ${subcategoryOrTag === s.id ? 'active' : ''}`}
                onClick={() => handleSubcategory(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {showAlgorithmTypes && (
          <div className="subcategories">
            <span className="sub-label">Algorithm type:</span>
            <button
              type="button"
              className={`nav-btn sub ${algorithmTypeFilter === null ? 'active' : ''}`}
              onClick={() => setAlgorithmTypeFilter(null)}
            >
              All
            </button>
            {algorithmTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`nav-btn sub ${algorithmTypeFilter === t.id ? 'active' : ''}`}
                onClick={() => handleAlgorithmType(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {showHtmlTags && (
          <div className="subcategories">
            <span className="sub-label">Tag:</span>
            {htmlTags.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`nav-btn sub ${subcategoryOrTag === t.id ? 'active' : ''}`}
                onClick={() => setSubcategoryOrTag(subcategoryOrTag === t.id ? null : t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {showNodeSubcategories && (
          <div className="subcategories">
            <span className="sub-label">Topic:</span>
            {NODE_SUBCATEGORIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`nav-btn sub ${subcategoryOrTag === s.id ? 'active' : ''}`}
                onClick={() => setSubcategoryOrTag(subcategoryOrTag === s.id ? null : s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {showEjsSubcategories && (
          <div className="subcategories">
            <span className="sub-label">Topic:</span>
            {EJS_SUBCATEGORIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`nav-btn sub active`}
                onClick={() => setSubcategoryOrTag(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="main">
        {results.length === 0 ? (
          <p className="empty">No matches. Try another search or category.</p>
        ) : (
          <div className="cards">
            {results.map((item, i) => (
              <Card key={`${item.category}-${item.item}-${i}`} item={item} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
