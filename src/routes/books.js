import { Router } from 'express';
import request from 'request-promise';
import { parseString } from 'xml2js';

// Промежуточное ПО
import authenticate from '../middlewares/authenticate';

let router = Router();

// Маршруты промежуточного ПО
router.use(authenticate);

router.get('/search', (req, res) => {

  request
    .get(
      `https://www.goodreads.com/search/index.xml?key=M23N3qvy3oD6Shz7jHojsg&q=${req.query.q}`
    )
    .then(result => parseString(
      result,
      (err, goodreadsResult) => res.json({
        books: goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(
          work => ({
            goodreadsId: work.best_book[0].id[0]._,
            title: work.best_book[0].title[0],
            authors: work.best_book[0].author[0].name[0],
            covers: [work.best_book[0].image_url[0]]
          })
        )
      })
    ));
});

export default router;