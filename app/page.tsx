

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Ask Your Documents
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Upload PDFs, ask questions, and get AI-powered answers with source
          references.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Upload PDF
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              PDF upload component will go here (Step 2)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Ask a Question
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Question form component will go here (Step 4)
            </p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="What is this document about?"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-400"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
            <p className="mt-2 text-sm text-gray-500">
              AI answer will appear here (Step 6)
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm italic text-gray-400">
                Upload a PDF and ask a question to get started...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}