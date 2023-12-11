const express = require("express")
const router = express.Router()
const { nanoid } = require("nanoid")
const promClient = require('prom-client');

const idLenght = 8

// let requestCounter = 0;

// // Cчетчик для метрик
// const requestCounter = new promClient.Counter({
//     name: 'game_delete_requests',
//     help: 'Total number of delete requests for games',
//     labelNames: ['game_id'],
//   });

// Cчетчик для успешных запросов (HTTP 200)
const successfulRequestsCounter = new promClient.Counter({
    name: 'successful_http_requests',
    help: 'Total number of successful HTTP requests',
    labelNames: ['path'], 
  });

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the game
 *         name:
 *           type: string
 *           description: The game name
 *         description:
 *           type: string
 *           description: The game description
 *       example:
 *         id: d5fE_asz
 *         name: enter name
 *         description: enter discription
 */

/**
  * @swagger
  * tags:
  *   name: Games
  *   description: The games managing API
  */

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Returns the list of all the games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: The list of the games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */

router.get("/", (req, res) => {
    const games = req.app.db.get("games").value();
    res.render("index", { games }); 
});

router.get("/:id", (req, res) => {
    const game = req.app.db.get('games').find({id: req.params.id}).value()
    res.send(game)
})


/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get the game by id
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The game id
 *     responses:
 *       200:
 *         description: The game description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: The game was not found
 */

router.post("/", (req, res) => {
    try {
        const game = {
            id: nanoid(idLenght),
            ...req.body
        };
        req.app.db.get("games").push(game).write();
        res.status(201).send(game); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: The game was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       500:
 *         description: Some server error
 */

router.put("/:id", (req, res) => {
    try{
        req.app.db.get("games").find({id: req.params.id}).assign(req.body).write()

        res.send(req.app.db.get("games").find({id:req.params.id}))
    }
    catch(error)
    {
        return res.status(500).send(error)
    }
})

/**
 * @swagger
 * /games/{id}:
 *  put:
 *    summary: Update the game by the id
 *    tags: [Games]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The game id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Game'
 *    responses:
 *      200:
 *        description: The game was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Game'
 *      404:
 *        description: The game was not found
 *      500:
 *        description: Some error happened
 */

router.delete("/:id", (req, res) => {
    req.app.db.get("games").remove({id: req.params.id}).write()

    res.sendStatus(200)
})


router.get("/delete/:id", async (req, res) => {
    // try {
        req.app.db.get("games").remove({ id: req.params.id }).write();
        
        // Увеличиваем счетчик успешных запросов
        successfulRequestsCounter.inc({ path: req.path });

        res.redirect("/games");
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send("Internal Server Error");
    // }
});

// Маршрут для экспорта метрик
router.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
  
    try {
      const metrics = await promClient.register.metrics();
      res.end(metrics);
    } catch (err) {
      console.error('Error getting metrics:', err);
      res.status(500).end();
    }
  });

/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Remove the game by id
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The game id
 * 
 *     responses:
 *       200:
 *         description: The game was deleted
 *       404:
 *         description: The game was not found
 */

// router.get("/delete/:id", (req, res) => {
//     // requestCounter++;
//     // console.log(requestCounter);
//     req.app.db.get("games").remove({ id: req.params.id }).write();
//     res.redirect("/games");
// });



router.post("/edit/:id", (req, res) => {
    try {
        req.app.db.get("games").find({ id: req.params.id }).assign(req.body).write();
        res.redirect("/games");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/edit/:id", (req, res) => {
    const game = req.app.db.get('games').find({ id: req.params.id }).value();
    res.render("editGame", { game });
});

router.post("/new", (req, res) => {
    try {
        const game = {
            id: nanoid(idLength),
            ...req.body
        };
        req.app.db.get("games").push(game).write();
        res.redirect("/games");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/new", (req, res) => {
    res.render("newGame");
});

router.get("/", (req, res) => {
    const games = req.app.db.get("games").value();
    res.render("index", { games });
});

router.get("/:id", (req, res) => {
    const game = req.app.db.get('games').find({ id: req.params.id }).value();
    res.render("gameDetail", { game });
});

// router.get("/counter", (req, res) => 
// {
//     res.send(requestCounter);
// });


module.exports = router;