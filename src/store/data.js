import { defineStore } from "pinia";
import {ref, computed} from 'vue'
import { timedataAPI } from '../api'

export const timeDataStore = defineStore(
    'data', () =>{

        

        // 业务时间序列数据
        const selectedData = ref([])
        
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

        
        


        // 针对资源模板推荐
        const get_yw_business = async () => {
            const yw_business_list = await timedataAPI.get_available_business_yw()
            return yw_business_list
        }
        const  get_resource_data  = async (newBusiness) =>  {
            const resources = await timedataAPI.get_resource_data(newBusiness)
            return resources
        }



        // 对于业务数据
        const get_app_data = async (business_name) => {
            const apps = await timedataAPI.get_app_list(business_name)
            return apps
        } 
        const get_app_prediction = async (business_name, app_name, time_scale) => {
            const apps_data =  await  timedataAPI.getAPPPrediction(business_name,app_name,time_scale)
            return apps_data
        }


        // 相关性分析
        const get_cor_data = async () => {
            const cor_data = await timedataAPI.getCorData()
            return cor_data
        }
        const get_cors = async () => {
            const cors = await timedataAPI.getCors()
            return cors
        }
        return {
            get_business_list,
            get_vm_list,
            get_methods,
            get_bussiness_prediction,
            get_vm_prediction,
            get_yw_business,
            get_resource_data,
            get_app_data,
            get_app_prediction,
            selectedData,
            get_cor_data,
            get_cors
        }
    }
)



