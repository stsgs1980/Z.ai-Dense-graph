'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { AgentEditForm } from './use-agent-edit-form'
import { createAgentApi, saveAgentApi, deleteAgentApi } from './use-agent-mutations-helpers'

export interface CreateAgentInput {
  name: string; role: string; roleGroup: string; formula: string
  status: string; skills: string; description: string;
}

interface UseAgentMutationsOpts {
  onAgentCreated?: (agent: Record<string, unknown>) => void
  onAgentUpdated?: (agent: Record<string, unknown>) => void
  onAgentDeleted?: (agentId: string) => void
  onSuccess?: () => void
}

export function useAgentMutations(opts: UseAgentMutationsOpts = {}) {
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const optsRef = useRef(opts)
  optsRef.current = opts

  const createAgent = useCallback(async (input: CreateAgentInput) => {
    setCreating(true)
    try {
      return await createAgentApi(input, optsRef.current.onAgentCreated, optsRef.current.onSuccess)
    } catch {
      toast.error('Create failed', { description: 'Network error — please try again' })
    } finally { setCreating(false) }
    return null
  }, [])

  const saveAgent = useCallback(async (agentId: string, form: AgentEditForm) => {
    setSaving(true)
    try {
      return await saveAgentApi(agentId, form, optsRef.current.onAgentUpdated, optsRef.current.onSuccess)
    } catch {
      toast.error('Update failed', { description: 'Network error — please try again' })
    } finally { setSaving(false) }
    return false
  }, [])

  const deleteAgent = useCallback(async (agentId: string) => {
    setDeleting(true)
    try {
      return await deleteAgentApi(agentId, '', optsRef.current.onAgentDeleted, optsRef.current.onSuccess)
    } catch {
      toast.error('Delete failed', { description: 'Network error — please try again' })
    } finally { setDeleting(false) }
    return false
  }, [])

  return { creating, saving, deleting, showDeleteConfirm, setShowDeleteConfirm, createAgent, saveAgent, deleteAgent }
}