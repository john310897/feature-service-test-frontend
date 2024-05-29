import axios from 'axios'
const API_PREFIX = 'http://localhost:3001/api'

class AppService {
    uploadMessage(formObj) {
        return axios.post(API_PREFIX + '/UploadMessage', formObj, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    getPatientList() {
        return axios.get(API_PREFIX + '/data/patients')
    }
    getPatientMessageList(patientId) {
        return axios.get(API_PREFIX + '/data/message_list/' + patientId)
    }
}
export default new AppService();