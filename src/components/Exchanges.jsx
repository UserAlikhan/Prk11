import React, { useState } from 'react'
import { Row, Col, Typography, Select, Avatar, Collapse } from 'antd'
import millify from 'millify'
import HTMLReactParser from 'html-react-parser'

const { Title, Text } = Typography
const { Option } = Select
const { Panel } = Collapse

const Exchanges = () => {
  const exchangesList = ['Binance', 'Bybit', 'BingX', 'Forex.com', 'OKX']
  const [exchangeName, setExchangeName] = useState('Binance')

  return (
    <>
      <Row>
        <Col span={6}>Exchanges</Col>
        <Col span={6}>24h Trade Volume</Col>
        <Col span={6}>Markets</Col>
        <Col span={6}>Change</Col>
      </Row>
      <Row>
        {exchangesList.map((exchange) => (
          <Col span={24}>
            <Collapse>
              <Panel
                // key={exchange.uuid}
                showArrow={false}
                header={(
                  <Row key={exchange.uuid}>
                    <Col span={6}>
                      <Text><strong>{exchange.rank}.</strong></Text>
                      <Avatar className='exchange-image' src='https://public.bnbstatic.com/image/cms/blog/20230927/50fa2849-8097-486b-bcc8-c7c7d4b080d0.png'/>
                      <Text><strong>{exchange.name}</strong></Text>
                    </Col>
                    <Col span={6}>${millify(exchange.volume)}</Col>
                    <Col span={6}>${millify(exchange.numberOfMarkets)}</Col>
                    <Col span={6}>${millify(exchange.marketShare)}</Col>
                  </Row>
                )}
              >
                {HTMLReactParser(exchange.description || '')}
              </Panel>
            </Collapse>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Exchanges