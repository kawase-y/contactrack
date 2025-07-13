// Google API JavaScript Client Library の型定義

declare global {
  interface Window {
    gapi: typeof gapi
  }

  namespace gapi {
    interface LoadCallback {
      (): void
    }

    function load(api: string, callback: LoadCallback): void

    namespace auth2 {
      interface AuthInstance {
        isSignedIn: {
          get(): boolean
        }
        signIn(): Promise<GoogleUser>
        signOut(): Promise<void>
      }

      interface GoogleUser {
        getId(): string
        getBasicProfile(): BasicProfile
        getAuthResponse(): AuthResponse
      }

      interface BasicProfile {
        getId(): string
        getName(): string
        getGivenName(): string
        getFamilyName(): string
        getImageUrl(): string
        getEmail(): string
      }

      interface AuthResponse {
        access_token: string
        id_token: string
        scope: string
        expires_in: number
        first_issued_at: number
        expires_at: number
      }

      function init(config: {
        client_id: string
        scope: string
      }): Promise<void>

      function getAuthInstance(): AuthInstance
    }

    namespace client {
      function init(config: {
        apiKey: string
        clientId: string
        discoveryDocs: string[]
        scope: string
      }): Promise<void>

      function request(config: {
        path: string
        method: string
        params?: Record<string, any>
        headers?: Record<string, string>
        body?: string
      }): Promise<{
        status: number
        statusText: string
        body: string
        result: any
      }>

      namespace drive {
        namespace files {
          function create(config: {
            resource?: {
              name?: string
              parents?: string[]
              description?: string
              mimeType?: string
            }
            media?: {
              mimeType: string
              body: string | Blob
            }
            uploadType?: string
          }): Promise<{
            result: {
              id?: string
              name?: string
              mimeType?: string
            }
          }>

          function list(config: {
            q?: string
            orderBy?: string
            fields?: string
            spaces?: string
          }): Promise<{
            result: {
              files?: Array<{
                id?: string
                name?: string
                modifiedTime?: string
                size?: string
                mimeType?: string
              }>
            }
          }>

          function get(config: {
            fileId: string
            alt?: string
          }): Promise<{
            status: number
            body: string
            result?: any
          }>
        }
      }
    }
  }
}