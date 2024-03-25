import React, { useState } from 'react'
import { Select, Typography, Row, Col, Avatar, Card } from 'antd'
import moment from 'moment'

import { useGetCryptoNewsQuery } from '../services/cryptoNewsAPI'
import { useGetCryptosQuery } from '../services/cryptoAPI'

const {Text, Title} = Typography
const { Option } = Select

const News = ({ simplified }) => {

  const [newsCategory, setNewsCategory] = useState('crypto')

  const pageSize = simplified ? 6: 12;

  const {data: cryptoNews, isFetching} = useGetCryptoNewsQuery({
    country: 'us',
    language: 'en',
    pageSize: pageSize,
    category: newsCategory
  });
  const {data} = useGetCryptosQuery(100)

  if (!cryptoNews?.articles) return 'Loading...'

  // console.log(cryptoNews)
  // console.log('DAta', data)

  return (
    <Row gutter={[24, 24]} className='cryptoNews-card-container'>
      {/* select at the top so we can get news about one specific cryptocurrency */}
      {!simplified ? (
        <Col span={24}>
          <Select
            showSearch
            className='select-news'
            placeholder='Select a news category'
            optionFilterProp='children'
            onChange={(value) => setNewsCategory(value)}
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            <Option value="crypto">Crypto</Option>
            {data?.data?.coins.map((coin) => <Option value={coin.name}>{coin.name}</Option>)}
          </Select>
        </Col>
      ) : null}
        {cryptoNews.articles.map((news, i) => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <Card hoverable className='news-card'>
              <a href={news.url} target='_blank' rel='noreferrer'>
                <div className='news-image-container'>
                  <Title className='news-title' level={4}>{news.title}</Title>
                </div>

                <p>
                  {news?.title > 100 ? `${news.title.substring(0, 100)}...`
                  : news.title}
                </p>

                <div className='provider-container'>
                  <div>
                    <Avatar src={news?.publisher?.url} alt='news'/>
                    
                  </div>
                  <Text>{moment(news?.published_date).startOf('ss').fromNow()}</Text>
                </div>
              </a>
            </Card>
          </Col>
        ))}
    </Row>
  )
}

export default News