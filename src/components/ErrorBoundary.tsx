import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center p-8">
          <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-red-700 mb-2">Runtime error</p>
            <pre className="text-xs text-red-600 whitespace-pre-wrap break-all">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
