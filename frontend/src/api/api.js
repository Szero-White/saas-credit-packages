import axiosClient from './axiosClient'

export const authApi = {
  login: (payload) => axiosClient.post('/auth/login', payload),
  register: (payload) => axiosClient.post('/auth/register', payload),
  me: () => axiosClient.get('/auth/me'),
}

export const packageApi = {
  list: () => axiosClient.get('/packages'),
  create: (payload) => axiosClient.post('/packages', payload),
  update: (id, payload) => axiosClient.put(`/packages/${id}`, payload),
  remove: (id) => axiosClient.delete(`/packages/${id}`),
}

export const creditApi = {
  current: () => axiosClient.get('/credits/me'),
  logs: () => axiosClient.get('/credit-logs/me'),
}

export const purchaseApi = {
  buy: (packageId) => axiosClient.post('/purchases', { package_id: packageId }),
  transactions: () => axiosClient.get('/transactions/me'),
}

export const featureApi = {
  all: () => axiosClient.get('/features'),
  mine: () => axiosClient.get('/features/me'),
  use: (code) => axiosClient.post(`/features/${code.replaceAll('_', '-')}/use`),
}
