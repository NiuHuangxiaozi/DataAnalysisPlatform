import { defineStore } from "pinia";
import {ref, computed} from 'vue'
import { timedataAPI } from '../api'

export const timeDataStore = defineStore(
    'data', () =>{

        

        // 业务时间序列数据
        const selectedData = ref([])
        


        // // 某一个主机的时间序列数据
        // const get_business_list = async () =>{
        //     const business_list = await timedataAPI.getBusinessLiest()
        //     return business_list
        // }


        // 获取业务列表
        const get_business_list = async () =>{
            const business_list = await timedataAPI.getBusinessLiest()
            return business_list
        }

        // 获取指定业务下面的ip列表
        const get_vm_list = async (business_name) =>{
            const business_vm_list = await timedataAPI.getVmList(business_name)
            return business_vm_list
        }

        // 获取方法列表
        const get_methods = async () => {
            const method_list = await timedataAPI.getMethods()
            return method_list
        }


        // 获得整个业务的预测数据
        const get_bussiness_prediction = async (dimension, business) => {
            const time_series_list = await timedataAPI.getBusinessPrediction(dimension, business)
            return time_series_list
        }

    
        // 获得一个主机的预测数据
        const get_vm_prediction = async (dimension, business, ip) => {
            const time_series_list = await timedataAPI.getVMPrediction(dimension, business, ip)
            return time_series_list
        }

        

        

        return {
            get_business_list,
            get_vm_list,
            get_methods,
            get_bussiness_prediction,
            get_vm_prediction,
            selectedData
        }
    }
)



