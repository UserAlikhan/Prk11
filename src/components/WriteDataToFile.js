// import fs from 'fs'

const WriteToFile = (dataset, coinId) => {
    try {
        const data = JSON.stringify(dataset)
        localStorage.setItem(`${coinId}Data`, data)
        console.log('Data has written correctly!')
    } catch (error) {
        console.error('Error writing data: ', error)
    }
}

export default WriteToFile

// const WriteToFile = (dataset, coinId) => {

//     const data = JSON.stringify(dataset)

//     fs.writeFile(`../files/${coinId}Data.json`, data, (error) => {
//         // throwing the error
//         // in case of a writing problem
//         if (error) {
//             console.error(error)

//             throw error
//         }
//         else {
//             console.log('Data has written correctly!')
//         }
//     })
// }

// export default WriteToFile