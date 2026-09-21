import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md text-center">
            <h1
              className="text-3xl text-gray-800 mb-3"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              Etwas ist schiefgelaufen
            </h1>
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-teal-400 mb-4" />
            <p
              className="text-gray-600 mb-6"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Die App ist auf einen unerwarteten Fehler gelaufen. Ein Neuladen
              behebt das meistens – dein Fortschritt bleibt gespeichert.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
