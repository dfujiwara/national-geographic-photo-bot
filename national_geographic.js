/*
global muxbots
*/

muxbots.onFeedPull((callback) => {
  handleOnFeedPull(callback)
})

const handleOnFeedPull = async (callback) => {
  const lastFetchDate = muxbots.localStorage.getItem('lastFetchDate')
  const currentDateString = new Date().toDateString()
  if (lastFetchDate === currentDateString) {
    muxbots.newResponse()
      .addNoResultsMessage('No more photo for the day, please come back tomorrow!')
      .send(callback)
    return
  }
  try {
    const pageContent = await fetchPhotoOfTheDay()
    const photoOfTheDay = parseOpenGraph(pageContent)
    muxbots.newResponse()
      .addImage(photoOfTheDay.imageURL)
      .addWebpageSmall(muxbots.newWebpage()
        .setURL(photoOfTheDay.url)
        .setTitle(photoOfTheDay.title)
        .setImage('https://www.nationalgeographic.com/etc/designs/platform/v3/images/apple-touch-icon.ngsversion.5aab2046.png'))
      .send(callback)
    muxbots.localStorage.setItem('lastFetchDate', currentDateString)
  } catch (error) {
    console.log(error)
    muxbots.newResponse()
      .addNoResultsMessage('An issue occurred while fetching the photo')
      .send(callback)
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
