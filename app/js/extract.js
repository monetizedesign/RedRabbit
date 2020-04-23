'use strict'

const extract = {

  save: async (event, html) => {
    const $ = cheerio.load(html)
    $('.Post').each(async (i, element) => {
      let included_image = $(element).find('[data-click-id="image"]').attr('style')
      if (included_image) {
        included_image = included_image.replace('background-image:url(', '').replace(');', '').replace(/border-color:.*?/g,"")
        let checkCSS = included_image.split('#')
        if (checkCSS[1]) {
          included_image = checkCSS[0]
        }
      }
      const title = $(element).find('a[data-click-id="body"]').first().text()
      const url = $(element).find('a[data-click-id="body"]').attr('href')
      const attached_image = $(element).find('img.media-element, img.ImageBox-image').attr('src')
      const included_link = $(element).find('a.styled-outbound-link').attr('href')
      const snippet = $(element).find('[data-click-id="text"]').text()
      const sentiment = new Sentiment()
      const score = sentiment.analyze(`${title} ${snippet}`).score
      let reddit_video = $(element).find('video').attr('poster')
      if (included_link && included_link !== '') {
          reddit_video = await start(included_link, title)
          async function start(url, title) {
            if (url.includes('youtu.be/')) {
              let youtube_id = url.split('.be/')
              youtube_id = youtube_id[1]
              url = `https://www.youtube.com/watch?v=${youtube_id}`
            }
            const response = await fetch(url)
            const result = await response.text()
            const doc = domino.createWindow(result).document
            const metadata = getMetadata(doc, url)
            return metadata.image
          }
      }
      await prisma_query.create_post(title, url, attached_image, included_image, included_link, snippet, community_id, score, reddit_video)
    })
  }

}

module.exports = extract
