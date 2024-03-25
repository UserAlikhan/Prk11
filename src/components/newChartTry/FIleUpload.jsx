import Papa, { parse } from 'papaparse'
import FileInput from './FileInput'
import { useEffect, useState } from 'react'
import { getData } from './utils'

const FileUpload = () => {

    const [data, setData] = useState([])
    
    function parseTsvFile(file, onDataParsed) {
        Papa.parse(file, {
            complete: (result) => {
                onDataParsed(result.data)
            },
            header: true,
            delimiter: '\t'
        })
    }

    async function loadRemoteFile() {
        try {
            const response = await fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
            const tsvText = await response.text()

            // convert tsv file to Blob
            const tsvBlob = new Blob([tsvText], {type: 'text/tsv'})
            const tsvFile = new File([tsvBlob], 'MSFT.tsv');

            parseTsvFile(tsvFile, setData)
        } catch (error) {
            console.error("Error fetching or parsing the remote TSV file:", error)
        }
    }

    useEffect(() => {
        loadRemoteFile()
        console.log(data)
    }, [])

    return (
        <main>
            <div 
                id='fileDrop'
                onDragOver={(e) => {
                    e.preventDefault()
                }}
                onDrop={async (e) => {
                    e.preventDefault()
                    let dataArray = []

                    const data = await Object.values(e.dataTransfer.files).map((file) => {
                        if (file.type === 'text/tap-separated-values'){
                            const text = file.text()
                            text.then(text => {
                                const parsed =  Papa.parse(text, {delimiter: '\t'})
                                parsed.data.forEach(row => {
                                    dataArray.push(row)
                                    return row
                                })
                            })
                        }
                    })

                    console.log('a ', data)
                    console.log('b ', dataArray)
                    console.log('c ', dataArray[0])
                }}
            >
                <h1>Read .tsv file</h1>
            </div>
        </main>
    )
}

export default FileUpload