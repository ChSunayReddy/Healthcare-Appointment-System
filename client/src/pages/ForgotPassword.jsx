import {Button, Form , Input} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {useDispatch} from "react-redux";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { hideLoading, showLoading } from '../redux/alertsSlice';
function ForgotPassword(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const onFinish=async(values) =>{
        try{
            dispatch(showLoading());
            const response =await axios.post('/api/user/forgot-password',values);
            dispatch(hideLoading());
            if(response.data.success){
                toast.success(response.data.message);
                navigate("/login");
            }else{
                toast.error(response.data.message);
            }
        }
        catch(error){
            dispatch(hideLoading());
            toast.error("something went wrong");
        }
    }
    return (
        <div className='authentication'>
            <div className='authentication-form card p-3'>
                <h1 className="card-title">Change Password</h1>
                <Form layout='vertical' onFinish={onFinish}>
                    <Form.Item label='Email' name='email'>
                        <Input placeholder="Email"/>
                    </Form.Item>
                    <Form.Item label='Password' name='password'>
                        <Input placeholder="Password" type='password'/>
                    </Form.Item>
                    <Form.Item label='Confirm Password' name='confirm-password'>
                        <Input placeholder="confirm Password" type='password'/>
                    </Form.Item>
                    <Button className='primary-button my-2 full-width-button' htmlType='submit'>Change Password</Button>

                    <Link to='/login' className='anchor mt-2'>CLICK HERE TO LOGIN</Link>
                </Form>
            </div>
        </div>
    )
}
export default ForgotPassword