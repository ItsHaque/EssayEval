import Layout from '@/components/Layout'

function App() {
  return (
    <Layout
      left={<div className="p-4 text-sm text-gray-500">Rubric panel</div>}
      center={<div className="text-sm text-gray-500">Essay editor</div>}
      right={<div className="p-4 text-sm text-gray-500">Results panel</div>}
    />
  )
}

export default App