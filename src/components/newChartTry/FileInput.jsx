import React, { useState } from "react"
import Papa from 'papaparse'

const FileInput = ({ file }) => {
    

    return (
        <div>
            Здаров
        </div>
    )
}

export default FileInput

// const FileInput = ({ onFileSelect }) => {
    
//     const handleFileChange = (e) => {
//         const file = e.target.files[0]
//         onFileSelect(file)
//     }

//     return (
//         <input type="file" accept=".tsv" onChange={handleFileChange}/>
//     )
// }

// export default FileInput