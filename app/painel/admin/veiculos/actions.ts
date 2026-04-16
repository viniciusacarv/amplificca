'use server'

import { salvarVeiculo as salvarVeiculoAdminImprensa } from '../imprensa/actions'

export async function salvarVeiculo(formData: FormData) {
  return salvarVeiculoAdminImprensa(formData)
}
