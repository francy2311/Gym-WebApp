import { useEffect } from 'react'
import { APP_NAME } from '../constants/app'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  }, [title])
}
