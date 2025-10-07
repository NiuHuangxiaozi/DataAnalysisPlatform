import axios from "axios";



const api = axios.create({
    baseURL: 'http://10.134.83.22:3000',
    timeout:60000,
    headers:{
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
    // localStorage是现代浏览器都实现的一个小型数据库，全局可以访问
    const token = "7K9p2mRvXwQnLsEaT5yB8cZx"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    
    return Promise.reject(error)
  }
)



export const authAPI = {
    verify_token: () =>api.get("/login/verify_token")
}
export const timedataAPI = {
    getBusinessLiest: () => api.get("/jw/get_available_business"),
    getVmList : (Business_name) => api.get("/jw/get_available_machine_ips",
      {
        params: {
            business: Business_name
        }
      }
    ),
     
    getMethods: () =>api.get("/model/get_available_model"),
    getBusinessPrediction : (dimension, business) =>api.get("/jw/get_predict",
      {
        params: {
            dimension: dimension, // 对应接口的dimension查询参数
            business: business     // 对应接口的business查询参数
        }
      }
    ),

    getVMPrediction : (dimension, business, ip) => api.get("/jw/get_single_predict",
        {
        params: {
            dimension: dimension, // 对应接口的dimension查询参数
            business: business,     // 对应接口的business查询参数
            ip: ip
        }
      }
    ),

    // 获取业务对应的应用
    get_available_business_yw : () => api.get("/jw/get_available_business_yw"),

    get_resource_data : (newBusiness) => api.get("/jw/recommend_config",
      {
        params: {
            business: newBusiness
        }
      }
    ),

    get_app_list : (business_name) => api.get("/jw/get_available_app",
      {
        params: {
          business : business_name
        }
      }
    ),
    getAPPPrediction : (business_name, app_name, time_scale) => api.get(
      "/jw/get_single_predict_app",
      {
        params : {
          dimension: time_scale,
          business: business_name,
          app: app_name
        }
      }
    )
}
