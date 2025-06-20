import axios from 'axios'
import papaparse from 'papaparse'
import { useState } from 'react'
import { CgSpinner } from 'react-icons/cg'
import { useDataset } from 'sanity'

import Container from '../container'

const FileUpload = () => {
  const [csvData, setCsvData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMesg, setSuccessMesg] = useState('')
  const [errorMesg, setErrorMesg] = useState('')
  const dataset = useDataset()

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const csvText = reader.result
        setCsvData(csvText)
      }
      reader.readAsText(file)
    }
  }

  const parseCSV = async (csvText: string, dataset: string) => {
    setLoading(true)
    setSuccessMesg('')
    setErrorMesg('')

    if (csvText) {
      const { data, errors } = papaparse.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      })

      if (errors.length > 0) {
        setLoading(false)
        setErrorMesg('Something went wrong while uploading CSV. Please try again after sometime.')
      } else {
        try {
          await axios.post('/api/add-posts', {
            data,
            dataset,
          })
          setLoading(false)
          setSuccessMesg(
            'CSV file uploaded successfully. You will get the post creation report on registered email address for report.'
          )
        } catch (error) {
          setLoading(false)
          setErrorMesg('Something went wrong while adding posts. Please try again after sometime.')
        }
      }
    } else {
      setLoading(false)
      setErrorMesg('CSV text is empty or not properly loaded.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    parseCSV(csvData, dataset)
  }

  return (
    <section>
      <Container>
        <div className="py-9">
          <div className="flex justify-center">
            <form
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-[500px]"
            >
              <div className="w-full">
                <label
                  htmlFor="formFile"
                  className="mb-2 block text-neutral-700 dark:text-neutral-200"
                >
                  File Upload
                </label>
                <input
                  className="focus:border-primary focus:shadow-te-primary dark:focus:border-primary relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:text-neutral-700 focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100"
                  type="file"
                  id="formFile"
                  onChange={handleFileChange}
                  aria-describedby="file_input_csv"
                  accept=".csv"
                />
              </div>
              <div className="flex w-full items-center">
                <button
                  className="me-2 mb-2 mt-2 mr-2 rounded-full bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Upload
                </button>
                {loading && (
                  <CgSpinner className="mt-0 ml-2 block h-6 w-6 animate-spin text-blue-700" />
                )}
              </div>
              <div className="w-full">
                {successMesg && (
                  <p className="text_para pe-0 pe-xl-5 me-0 me-lg-5 pt-2 text-sm text-green-600">
                    {successMesg}
                  </p>
                )}
                {errorMesg && (
                  <p className="text_para pe-0 pe-xl-5 me-0 me-lg-5 pt-2 text-sm text-red-600">
                    {errorMesg}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default FileUpload