import { X, Save, Trash2, AlertTriangle } from 'lucide-react'
import { EditForm } from '@/features/hierarchy/lib/use-agent-edit'
import { AgentEditFormFields } from './agent-edit-form-fields'

function DeleteConfirmation({ editingAgent, editDeleting, handleEditDelete, setShowDeleteConfirm }: {
  editingAgent: any; editDeleting: boolean; handleEditDelete: () => void; setShowDeleteConfirm: (v: boolean) => void
}) {
  return (
    <div style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.06)', borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <AlertTriangle size={12} color="#EF4444" />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#EF4444' }}>Delete &quot;{editingAgent.name}&quot;?</span>
      </div>
      <div style={{ fontSize: 9, color: '#B0B0B0', marginBottom: 8 }}>This action cannot be undone. The agent and its tasks will be permanently removed.</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleEditDelete} disabled={editDeleting}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 5, fontSize: 10, fontWeight: 600,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444',
            cursor: editDeleting ? 'wait' : 'pointer', opacity: editDeleting ? 0.6 : 1 }}>
          {editDeleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button onClick={() => setShowDeleteConfirm(false)}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 5, fontSize: 10, fontWeight: 600,
            background: '#1A1A1A', border: '1px solid rgba(51,51,51,0.4)', color: '#B0B0B0', cursor: 'pointer' }}>
          Keep
        </button>
      </div>
    </div>
  )
}

export function AgentEditModal({
  editingAgent, setEditingAgent, editForm, setEditForm,
  editSaving, editDeleting, showDeleteConfirm, setShowDeleteConfirm, handleEditSave, handleEditDelete,
}: {
  editingAgent: any; setEditingAgent: (a: any) => void; editForm: EditForm
  setEditForm: (f: EditForm | ((prev: EditForm) => EditForm)) => void
  editSaving: boolean; editDeleting: boolean; showDeleteConfirm: boolean; setShowDeleteConfirm: (v: boolean) => void
  handleEditSave: () => void; handleEditDelete: () => void
}) {
  if (!editingAgent) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) setEditingAgent(null) }}>
      <div style={{ background: '#0A0A0A', border: '1px solid rgba(51,51,51,0.5)', borderRadius: 12, maxWidth: 420, width: 'calc(100vw - 32px)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(51,51,51,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#06B6D4' }}>Edit Agent</div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Update agent properties</div>
          </div>
          <button onClick={() => setEditingAgent(null)}
            style={{ padding: 4, borderRadius: 4, background: 'rgba(51,51,51,0.2)', border: '1px solid rgba(51,51,51,0.3)', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
        <AgentEditFormFields editForm={editForm} setEditForm={setEditForm} />
        {showDeleteConfirm && <DeleteConfirmation editingAgent={editingAgent} editDeleting={editDeleting} handleEditDelete={handleEditDelete} setShowDeleteConfirm={setShowDeleteConfirm} />}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(51,51,51,0.3)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {!showDeleteConfirm && (
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}>
              <Trash2 size={10} />Delete
            </button>
          )}
          <button onClick={() => setEditingAgent(null)}
            style={{ padding: '6px 16px', borderRadius: 6, background: '#1A1A1A', border: '1px solid rgba(51,51,51,0.4)', color: '#B0B0B0', cursor: 'pointer', fontSize: 11 }}>Cancel</button>
          <button onClick={handleEditSave} disabled={editSaving || !editForm.name.trim()}
            style={{ padding: '6px 16px', borderRadius: 6, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4',
              cursor: editSaving ? 'wait' : 'pointer', fontSize: 11, opacity: !editForm.name.trim() || editSaving ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Save size={10} />{editSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}