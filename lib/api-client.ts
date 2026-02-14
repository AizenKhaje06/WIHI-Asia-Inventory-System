/**
 * API Client
 * 
 * Client-side wrapper for making authenticated API requests
 * Automatically adds authentication headers to all requests
 */

/**
 * Add authentication headers to fetch requests
 */
function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}

  try {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('userRole')
    const displayName = localStorage.getItem('displayName')

    const headers: Record<string, string> = {}

    if (username) headers['x-user-username'] = username
    if (role) headers['x-user-role'] = role
    if (displayName) headers['x-user-display-name'] = displayName

    return headers
  } catch (error) {
    console.error('[API Client] Error reading auth from localStorage:', error)
    return {}
  }
}

/**
 * Authenticated fetch wrapper
 * Use this instead of fetch() for all API calls
 * 
 * @example
 * const items = await apiFetch('/api/items')
 * const newItem = await apiFetch('/api/items', { method: 'POST', body: JSON.stringify(data) })
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = getAuthHeaders()
  
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Authenticated fetch with JSON response
 * Automatically parses JSON and handles errors
 * 
 * @example
 * const items = await apiGet<InventoryItem[]>('/api/items')
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  const response = await apiFetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    console.error(`[API Client] GET ${url} failed:`, response.status, error)
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Authenticated POST request
 * 
 * @example
 * const newItem = await apiPost('/api/items', { name: 'Product', quantity: 10 })
 */
export async function apiPost<T = any>(url: string, data: any): Promise<T> {
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Authenticated PUT request
 * 
 * @example
 * await apiPut('/api/items/123', { quantity: 20 })
 */
export async function apiPut<T = any>(url: string, data: any): Promise<T> {
  const response = await apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Authenticated DELETE request
 * 
 * @example
 * await apiDelete('/api/items/123')
 */
export async function apiDelete(url: string): Promise<void> {
  const response = await apiFetch(url, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
}
