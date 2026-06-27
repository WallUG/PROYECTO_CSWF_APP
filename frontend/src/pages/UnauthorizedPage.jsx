function UnauthorizedPage() {
  return (
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow text-center py-12">
      <h1 className="text-[1.6rem] font-bold text-white mb-3">Acceso denegado</h1>
      <p className="text-gray-400">Este módulo solo está disponible para usuarios con rol de administrador.</p>
    </section>
  )
}

export default UnauthorizedPage
