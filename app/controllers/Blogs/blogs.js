const { pool } = require("../../config/db.config");
exports.createBlog = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { title,
            image,
            description
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: true, message: "Please Provide Title" });
        }
        const userData = await pool.query("INSERT INTO blogs(title,image,description,status) VALUES($1,$2,$3,$4) returning *",
                    [title, image, description, 'inactive']
                );
                res.status(200).json({
                    error: false,
                    data: userData.rows[0],
                    message: "News Created Successfully",
                });


    } catch (err) {
        res.status(500).json({ error: true, data: [], message: "Catch error" });
    } finally {
        client.release();
    }
};
exports.updateBlog = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            blog_id,
            status,

        } = req.body;
        // const blogser = false;
        if (blog_id === null || blog_id === "" || blog_id === undefined) {
            res.json({ error: true, message: "Please Provide Blog Id" });

        } else {

            let query = 'UPDATE blogs SET ';
            let index = 2;
            let values = [blog_id];


            if (status) {
                query += `status = $${index} , `;
                values.push(status)
                index++
            }
            query += 'WHERE blog_id = $1 RETURNING*'
            query = query.replace(/,\s+WHERE/g, " WHERE");


            const result = await pool.query(query, values)



            if (result.rows.length === 0) {
                res.json({ error: true, data: [], message: "Something went wrong" });

            } else {
                res.json({ error: false, data: result.rows, message: "Updated Status Successfully" });

            }

        }

    }
    catch (err) {
        res.json({ error: true, data: [], message: "Catch eror" });

    } finally {
        client.release();
    }


}

exports.deleteBlog = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            featured_companies_id,
        } = req.body;
        // const blogser = false;
        if (featured_companies_id === null || featured_companies_id === "" || featured_companies_id === undefined) {

            res.json({ error: true, message: "Please Provide Blog Id" });

        } else {


            const deleteUserQuery = await pool.query(
                "DELETE FROM featured_companies WHERE featured_companies_id = $1",
                [featured_companies_id]
            );

            // Check if any rows were deleted
            if (deleteUserQuery.rowCount === 1) {
                res.json({ error: false, message: "Blog Deleted Successfully" });
            } else {
                res.json({ error: true, message: "Cannot Delete Blog" });
            }

        }

    }
    catch (err) {

        res.json({ error: true, data: [], message: "Catch eror" });

    } finally {
        client.release();
    }
}
exports.deleteAllBlog = async (req, res) => {
    const client = await pool.connect();
    try {

        const deleteUserQuery = await pool.query(
            "DELETE FROM blogs"
        );

        // Check if any rows were deleted
        if (deleteUserQuery.rowCount === 0) {
            res.json({ error: true, message: "Cannot Delete Blog" });

        } else {
            res.json({ error: false, message: "All Blog Deleted Successfully" });

        }

    }
    catch (err) {
        res.json({ error: true, data: [], message: "Catch eror" });

    } finally {
        client.release();
    }
}

exports.getAllBlogs = async (req, res) => {
    const client = await pool.connect();
    try {

        const query = 'SELECT * FROM blogs ORDER BY created_at DESC'
        const result = await pool.query(query);


        if (result.rows) {
            res.json({
                message: "All Blogs Fetched",
                error: false,
                result: result.rows
            })
        }
        else {
            res.json({
                message: "could not fetch",
                error: true,
            })
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "Error Occurred",
            error: true,
        })
    }
    finally {
        client.release();
    }
}
exports.getAllBlogsActive = async (req, res) => {
    const client = await pool.connect();
    try {

        const query = 'SELECT * FROM blogs WHERE status = $1 ORDER BY created_at DESC'
        const params = ['active'];
        const result = await pool.query(query,params);


        if (result.rows) {
            res.json({
                message: "All Blogs Fetched",
                error: false,
                result: result.rows
            })
        }
        else {
            res.json({
                message: "could not fetch",
                error: true,
            })
        }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "Error Occurred",
            error: true,
        })
    }
    finally {
        client.release();
    }
}

exports.getBlogDetails = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            blog_id,
        } = req.body;
        //    const type="admin"
        const query = 'SELECT * FROM blogs WHERE blog_id =$1 '
        const result = await pool.query(query, [blog_id]);
        // get messages 
        const Data = result.rows[0]//Log
        res.json({
            message: "All blog Detail Fetched",
            error: false,
            data: Data,
        });

    }
    catch (err) {
        console.log(err)
        res.json({
            message: "Error Occurred",
            error: true,
            data: err.message
        })
    }
    finally {
        client.release();
    }
}


