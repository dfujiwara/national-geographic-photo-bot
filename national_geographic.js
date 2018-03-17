/*
global muxbots
*/

muxbots.onFeedPull((callback) => {
  handleOnFeedPull(callback)
})

const handleOnFeedPull = async (callback) => {
  try {
    const pageContent = await fetchPhotoOfTheDay()
    const photoOfTheDay = parseOpenGraph(pageContent)
    muxbots.newResponse()
      .addMessage(`"${photoOfTheDay.title}"`)
      .addImage(photoOfTheDay.imageURL)
      .addMessage(`${photoOfTheDay.url}`)
      .send(callback)
  } catch (error) {
    console.log(error)
    muxbots.newResponse()
      .addNoResultsMessage('An issue occurred while fetching the photo')
  }
}

const fetchPhotoOfTheDay = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://www.nationalgeographic.com/photography/photo-of-the-day/'
    muxbots.http.get(url, (response) => {
      if (!response.data) {
        reject(response.error)
      }
      resolve(response.data)
    })
  })
}

const parseOpenGraph = (pageContent) => {
  const title = (/<meta property="og:title" content="(.*)"\/>/.exec(pageContent))[1]
  const imageURL = (/<meta property="og:image" content="(.*)"\/>/.exec(pageContent))[1]
  const url = (/<meta property="og:url" content="(.*)"\/>/.exec(pageContent))[1]
  return {title, imageURL, url}
}
