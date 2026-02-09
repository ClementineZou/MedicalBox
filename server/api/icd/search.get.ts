import { defineEventHandler, getQuery } from 'h3'

// ----------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------

interface ICDMockItem {
  code: string;
  title: string;
  keywords: string[];
}

interface ICDSearchResult {
  term: string;
  code: string;
  id: string;
}

interface WHOAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface WHOICDEntity {
  title: string;
  theCode?: string;
  id: string;
  matchingPVs?: Array<{ label: string }>;
}

interface WHOICDSearchResponse {
  destinationEntities: WHOICDEntity[];
}

// ----------------------------------------------------------------------
// Mock Data (Fallback)
// ----------------------------------------------------------------------

const MOCK_ICD_DATA: ICDMockItem[] = [
  { code: '5A11', title: '2型糖尿病 (Type 2 diabetes mellitus)', keywords: ['糖尿病', 'diabetes', 'tangniaobing'] },
  { code: '5A10', title: '1型糖尿病 (Type 1 diabetes mellitus)', keywords: ['糖尿病', 'diabetes', 'tangniaobing'] },
  { code: 'BA00', title: '原发性高血压 (Essential hypertension)', keywords: ['高血压', 'hypertension', 'gaoxueya'] },
  { code: 'CA23', title: '支气管哮喘 (Bronchial asthma)', keywords: ['哮喘', 'asthma', 'xiaochuan'] },
  { code: 'BC81', title: '冠状动脉心脏病 (Coronary heart disease)', keywords: ['冠心病', '心脏病', 'heart', 'guanxinbing'] },
  { code: 'CA40', title: '肺炎 (Pneumonia)', keywords: ['肺炎', 'pneumonia', 'feiyan'] },
  { code: 'DA42', title: '胃炎 (Gastritis)', keywords: ['胃炎', 'gastritis', 'weiyan'] },
  { code: '8A80', title: '偏头痛 (Migraine)', keywords: ['偏头痛', '头痛', 'migraine', 'piantoutong'] },
  { code: '6A70', title: '抑郁症 (Depressive disorders)', keywords: ['抑郁', 'depression', 'yiyu'] },
  { code: '6B00', title: '焦虑症 (Anxiety disorders)', keywords: ['焦虑', 'anxiety', 'jiaolv'] },
  { code: 'AA41', title: '过敏性鼻炎 (Allergic rhinitis)', keywords: ['鼻炎', 'rhinitis', 'biyan'] },
  { code: 'CA22', title: '慢性阻塞性肺病 (COPD)', keywords: ['慢阻肺', 'copd', 'manzifei'] },
  { code: 'FA20', title: '痛风 (Gout)', keywords: ['痛风', 'gout', 'tongfeng'] },
  { code: '3A90', title: '贫血 (Anemia)', keywords: ['贫血', 'anemia', 'pinxue'] },
  { code: 'GB54', title: '慢性肾脏病 (Chronic kidney disease)', keywords: ['肾病', 'kidney', 'shenbing'] },
  { code: '1C60', title: '湿疹 (Eczema)', keywords: ['湿疹', 'eczema', 'shizhen'] },
  { code: '8A00', title: '癫痫 (Epilepsy)', keywords: ['癫痫', 'epilepsy', 'dianxian'] },
  { code: 'LB10', title: '骨质疏松 (Osteoporosis)', keywords: ['骨质疏松', 'osteoporosis', 'guzhishusong'] }
]

function searchMockData(term: string): ICDSearchResult[] {
  const t = term.toLowerCase().trim()
  const results = MOCK_ICD_DATA.filter(item => {
    if (item.code.toLowerCase().includes(t)) return true
    if (item.title.toLowerCase().includes(t)) return true
    if (item.keywords.some(k => k.toLowerCase().includes(t))) return true
    return false
  })
  return results.map(r => ({
    term: r.title,
    code: r.code,
    id: r.code
  }))
}

// ----------------------------------------------------------------------
// Real API Implementation
// ----------------------------------------------------------------------

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    console.log('[ICD DEBUG] Using cached token')
    return cachedToken
  }

  try {
    const tokenEndpoint = "https://icdaccessmanagement.who.int/connect/token"
    console.log('[ICD DEBUG] Requesting new token from:', tokenEndpoint)
    
    // BACK TO ORIGINAL TOKEN LOGIC per user instructions
    const formData = new URLSearchParams()
    formData.append("grant_type", "client_credentials")
    formData.append("scope", "icdapi_access")

    // Using basic auth for token endpoint
    // Buffer conversion is safe in Node environments
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const response = await $fetch<WHOAccessTokenResponse>(tokenEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      timeout: 30000,
    })

    console.log('[ICD DEBUG] Token response received. Expires in:', response?.expires_in)

    if (response && response.access_token) {
      cachedToken = response.access_token
      tokenExpiry = Date.now() + response.expires_in * 1000
      return cachedToken
    }
  } catch (e: any) {
    console.error("[ICD ERROR] Failed to get Token:", e.message)
    if (e.response) {
       console.error("[ICD ERROR] Token error response:", e.response._data)
    }
    return null
  }
  return null
}

async function searchICD11WithAPI(term: string, token: string): Promise<ICDSearchResult[]> {
  try {
    // Use MMS Linearization with specific release to support POST and get Codes
    // URL: https://id.who.int/icd/release/11/2024-01/mms/search
    const releaseId = '2024-01'
    const url = `https://id.who.int/icd/release/11/${releaseId}/mms/search`
    console.log('[ICD DEBUG] Searching URL (POST):', url)
    
    // Construct Form Data Body
    const searchParams = new URLSearchParams()
    searchParams.append('q', term)
    searchParams.append('includeKeywordResult', 'true')
    searchParams.append('usesearchindex', 'true')
    
    // When using POST, API-Version header is critical
    const data = await $fetch<WHOICDSearchResponse>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "API-Version": "v2",
        "Accept-Language": "zh-cn,en", 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: searchParams,
      timeout: 30000 
    })

    console.log('[ICD DEBUG] Search raw response destinationEntities count:', data?.destinationEntities?.length ?? 0)

    if (data && data.destinationEntities && data.destinationEntities.length > 0) {
      console.log('[ICD DEBUG] First entity sample:', JSON.stringify(data.destinationEntities[0], null, 2))
      return data.destinationEntities.map((entity) => {
        // Replace <em class='found'> with <strong> tags for frontend rendering
        let title = entity.title
          .replace(/<em class='found'>/g, '<strong>')
          .replace(/<\/em>/g, '</strong>')
        
        if (entity.matchingPVs && entity.matchingPVs.length > 0) {
           const match = entity.matchingPVs[0].label
               .replace(/<em class='found'>/g, '<strong>')
               .replace(/<\/em>/g, '</strong>')

           if (match && !title.includes(match.replace(/<[^>]+>/g, ''))) { // Simple check to avoid duplication if title contains the match text
               title = `${title} (${match})`
           }
        }
        
        return {
          term: title,
          code: entity.theCode || '', 
          id: entity.id
        }
      })
    }
    
    // --------------------------------------------------------------------------------
    // Fallback: Code Search
    // If regular search returns nothing, check if the term is a valid ICD-11 Code
    // --------------------------------------------------------------------------------
    const codePattern = /^[A-Z0-9.]{3,}$/i
    if (codePattern.test(term)) {
        console.log('[ICD DEBUG] No search results, trying direct code lookup for:', term)
        try {
            const codeUrl = `https://id.who.int/icd/release/11/${releaseId}/mms/codeinfo/${encodeURIComponent(term)}`
            const codeInfo = await $fetch<any>(codeUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "API-Version": "v2",
                    "Accept-Language": "zh-cn,en", 
                    "Accept": "application/json"
                }
            })
            
            if (codeInfo && codeInfo.linearizationUri) {
                 console.log('[ICD DEBUG] Code info found, fetching entity details...')
                 // We found the code info, now fetch the Entity details to get the localized Title
                 const entityUrl = codeInfo.linearizationUri
                 const entityData = await $fetch<any>(entityUrl, {
                     headers: {
                        Authorization: `Bearer ${token}`,
                        "API-Version": "v2",
                        "Accept-Language": "zh-cn,en", 
                        "Accept": "application/json"
                    }
                 })
                 
                 if (entityData) {
                     let title = entityData.title
                     if (title && typeof title === 'object' && title['@value']) {
                         title = title['@value']
                     } else if (typeof title !== 'string') {
                         title = term // Fallback title
                     }
                     
                     console.log('[ICD DEBUG] Found entity by code:', title)
                     
                     return [{
                         term: title,
                         code: entityData.code || term,
                         id: entityData['@id'] || entityUrl
                     }]
                 }
            }
        } catch (err: any) {
            // Ignore 404s (code not found)
            if (err.statusCode !== 404) {
                console.log('[ICD DEBUG] Code lookup failed:', err.message)
            }
        }
    }

    return []
  } catch (e: any) {
    console.error("[ICD ERROR] Search API Error:", e.message)
    if (e.response) {
        console.error("[ICD ERROR] Search error response:", e.response._data)
    }
    return []
  }
}

// ----------------------------------------------------------------------
// Main Handler
// ----------------------------------------------------------------------

export default defineEventHandler(async (event): Promise<ICDSearchResult[]> => {
  const query = getQuery(event)
  const searchTerm = (query.q as string || '').trim()

  console.log('[ICD DEBUG] Incoming search request for:', searchTerm)

  if (!searchTerm || searchTerm.length < 1) return []

  const config = useRuntimeConfig()
  
  const clientId = config.icdClientId as string | undefined || process.env.ICD_CLIENT_ID?.trim()
  const clientSecret = config.icdClientSecret as string | undefined || process.env.ICD_CLIENT_SECRET?.trim()

  console.log('[ICD DEBUG] Credentials check - ClientID exists:', !!clientId, 'Secret exists:', !!clientSecret)

  if (clientId && clientSecret && clientId !== '' && clientSecret !== '') {
    const token = await getAccessToken(clientId, clientSecret)
    if (token) {
      const apiResults = await searchICD11WithAPI(searchTerm, token)
      if (apiResults.length > 0) {
        console.log(`[ICD DEBUG] Returning ${apiResults.length} results from API`)
        return apiResults
      } else {
        console.log('[ICD DEBUG] API returned 0 results, falling back to mock')
      }
    } else {
        console.warn("[ICD DEBUG] Could not obtain token, falling back to mock")
    }
  } else {
     console.log("[ICD DEBUG] No API credentials configured, falling back to mock")
  }

  // Fallback to Mock Data
  console.log('[ICD DEBUG] Performing Mock search')
  const mockResults = searchMockData(searchTerm)
  console.log(`[ICD DEBUG] Mock search returned ${mockResults.length} results`)
  return mockResults
})
