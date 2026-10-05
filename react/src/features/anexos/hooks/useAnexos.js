import { useState, useEffect } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { getErrorMessage } from '../../../shared/services/api'
import { listAttachments, uploadAttachments, deleteAttachment, downloadAttachment } from '../services/anexoService'
import { baixarBlob, filtrarEmpresasPorBusca } from '../utils/arquivo'

// "search" é o texto digitado na busca da barra superior.
export function useAnexos(search = '') {
  const { companies: empresas } = useAuth()
  const [anexos, setAnexos]           = useState({})   // { [empresaId]: anexo[] }
  const [abertos, setAbertos]         = useState({})   // { [empresaId]: true/false }
  const [uploading, setUploading]     = useState(false)
  const [uploadingId, setUploadingId] = useState(null)

  // Abre a primeira empresa quando a lista chega.
  useEffect(() => {
    if (empresas.length > 0 && Object.keys(abertos).length === 0) {
      setAbertos({ [empresas[0].id]: true })
    }
  }, [empresas])

  useEffect(() => {
    if (empresas.length === 0) return
    empresas.forEach(emp => loadAnexos(emp.id))
  }, [empresas])

  const loadAnexos = async (empresaId) => {
    try {
      const data = await listAttachments(empresaId)
      setAnexos(prev => ({ ...prev, [empresaId]: data }))
    } catch (err) {
      console.error('Erro ao carregar anexos:', err)
    }
  }

  const toggleEmpresa = (id) =>
    setAbertos(prev => ({ ...prev, [id]: !prev[id] }))

  const abrirEmpresa = (id) =>
    setAbertos(prev => ({ ...prev, [id]: true }))

  const handleUpload = async (empresaId, files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadingId(empresaId)
    abrirEmpresa(empresaId)

    try {
      const data = await uploadAttachments(empresaId, files)
      setAnexos(prev => ({ ...prev, [empresaId]: [...(prev[empresaId] || []), ...data] }))
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao enviar arquivo'))
    } finally {
      setUploading(false)
      setUploadingId(null)
    }
  }

  const handleDelete = async (empresaId, anexoId) => {
    try {
      await deleteAttachment(anexoId)
      setAnexos(prev => ({ ...prev, [empresaId]: prev[empresaId].filter(a => a.id !== anexoId) }))
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir anexo'))
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const blob = await downloadAttachment(id)
      baixarBlob(blob, fileName)
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao baixar arquivo'))
    }
  }

  const totalAnexos       = Object.values(anexos).reduce((s, arr) => s + arr.length, 0)
  const empresasComAnexos = empresas.filter(e => (anexos[e.id] || []).length > 0).length
  const empresasVisiveis  = filtrarEmpresasPorBusca(empresas, anexos, search)

  return {
    empresas, empresasVisiveis, anexos, abertos, uploading, uploadingId,
    toggleEmpresa, abrirEmpresa, handleUpload, handleDelete, handleDownload,
    totalAnexos, empresasComAnexos,
  }
}
