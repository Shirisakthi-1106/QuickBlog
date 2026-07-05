import React, { useState, useRef, useEffect } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import 'quill/dist/quill.snow.css'
import {parse} from 'marked';

const AddBlog = () => {
  const { axios } = useAppContext()

  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const [image, setImage] = useState(false)
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Startup')
  const [isPublished, setIsPublished] = useState(false)

  const generateContent = async () => {
    if(!title)return toast.error('Please enter a title')
      try {
    setLoading(true);
    const {data}=await axios.post('/api/blog/generate',{prompt:title})
    if(data.success){
      quillRef.current.root.innerHTML=parse(data.content)
    }else{
      toast.error(data.message)
    }

        
      } catch (error) {
        toast.error(error.message)
        
      }finally{
        setLoading(false);
      }
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      setIsAdding(true)

      const blog = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished
      }

      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      formData.append('image', image)

      const token = localStorage.getItem("token")

      const { data } = await axios.post('/api/blog/add', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        toast.success(data.message)
        setImage(false)
        setTitle('')
        setSubTitle('')
        quillRef.current.root.innerHTML = ''
        setCategory('Startup')
        setIsPublished(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll'>
      <div className='bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded'>

        {/* Image Upload */}
        <p>Upload thumbnail</p>
        <label htmlFor="image">
          <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="Upload" className='mt-2 h-16 rounded cursor-pointer' />
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
        </label>

        {/* Blog Title */}
        <p className='mt-4'>Blog title</p>
        <input
          type="text"
          placeholder="Type here"
          required
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded'
          onChange={e => setTitle(e.target.value)}
          value={title}
        />

        {/* Subtitle */}
        <p className='mt-4'>Sub title</p>
        <input
          type="text"
          placeholder="Type here"
          required
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded'
          onChange={e => setSubTitle(e.target.value)}
          value={subTitle}
        />

        {/* Description */}
        <p className='mt-4'>Blog description</p>
        <div className="max-w-lg pb-16 sm:pb-10 pt-2 relative">
          <div
            ref={editorRef}
            className="h-72 border border-gray-300 bg-white rounded overflow-auto p-2"
          ></div>
          {loading && 
          (<div className='absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2'>
            <div className='w-8 h-8 rounded-full border-2 border-t-white animate-spin'>
            </div>
           
          </div>)}
          <button disabled={loading}
            type="button"
            onClick={generateContent}
            className="absolute bottom-1 right-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer"
          >
            Generate with AI
          </button>
        </div>

        {/* Category */}
        <p className='mt-4'>Blog category</p>
        <select onChange={e => setCategory(e.target.value)} value={category} name="category" className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded'>
          <option value="">Select category</option>
          {blogCategories.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        {/* Publish Now */}
        <div className='flex gap-2 mt-4'>
          <p>Publish Now:</p>
          <input type="checkbox" checked={isPublished} className='scale-125 cursor-pointer' onChange={e => setIsPublished(e.target.checked)} />
        </div>

        {/* Submit Button */}
        <button disabled={isAdding} type="submit" className='mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm'>
          {isAdding ? 'Adding...' : 'Add Blog'}
        </button>
      </div>
    </form>
  )
}

export default AddBlog
