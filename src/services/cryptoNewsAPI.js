import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const cryptoNewsHeaders = {
    'X-RapidAPI-Key': '0a5c7cb853msh732b818d65d1c4dp1ab369jsnf77f461f1762',
    'X-RapidAPI-Host': 'news-api14.p.rapidapi.com'
}

const baseUrl = 'https://news-api14.p.rapidapi.com/top-headlines'

const createRequest = (url, params) => ({ url: `${url}?${new URLSearchParams(params).toString()}`, headers: cryptoNewsHeaders })

export const cryptoNewsApi = createApi({
    reducerPath: 'cryptoNewsApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
        getCryptoNews: builder.query({
            query: (params) => createRequest('', params)
        })
    })
})

export const {
    useGetCryptoNewsQuery,
} = cryptoNewsApi