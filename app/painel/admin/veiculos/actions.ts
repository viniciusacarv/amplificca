'use server'

import { salvarVeiculo as salvarVeiculoAdminImprensa, excluirVeiculo as excluirVeiculoAdminImprensa } from '../imprensa/actions'

export async function salvarVeiculo(formData: FormData) {
  return salvarVeiculoAdminImprensa(formData)
}

export async function excluirVeiculo(formData: FormData) {
  return excluirVeiculoAdminImprensa(formData)
}
