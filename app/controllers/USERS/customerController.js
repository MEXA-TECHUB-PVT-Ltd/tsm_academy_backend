const Emailtemplate = require("../../EmailUtils");
const { pool } = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { login_url, login_url_admin } = require("../../urls");
const EmailLinkButton = require("../../EmailLinkButton");
const { admin_email } = require("../../stripe_keys");
const generateRandomPassword = require("../../generateRandomPassword");
const EmailtemplateOTP = require("../../EmailOTP");

exports.registerCustomer = async (req, res, next) => {
  const client = await pool.connect();
  try {
    let password = generateRandomPassword(10);
    const { user_name, email, program_id, package_id } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide User Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      if (userDataCheck.rows.length === 0) {
        const salt = "mySalt";
        const status = "active";
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password + salt)
          .digest("hex");
        const userData = await pool.query(
          "INSERT INTO users(user_name,email,password,status) VALUES($1,$2,$3,$4) returning *",
          [user_name, email, hashedPassword, status]
        );
        const data = userData.rows[0];
        if (userData.rows.length === 0) {
          res.json({ error: true, data, message: "Can't Create User" });
        } else {
          const user_id = data.user_id;
          const userProgramData = await pool.query(
            "INSERT INTO req_programs(user_id,program_id,package_id) VALUES($1,$2,$3) returning *",
            [user_id, program_id, package_id]
          );
          const dataProg = userProgramData.rows[0];
          res.json({
            error: false,
            data,
            dataProg,
            message: "User Created Successfully",
          });
          const subject = "Welcome Email";
          //     const resetLink = login_url
          //     const password = '00'
          //     const buttonText = "User Portal"
          //     const message = `Welcome to our service! We're excited to have you on board.
          //     Here are a few tips to get you started:

          //     1. Explore our features: We offer a wide range of features to help you get the most out of our service.
          //     2. Check out our resources: We have a variety of resources available to help you learn more about our service.
          //     3. Get support: If you have any questions or need assistance, our support team is here to help.

          //     Thank you for choosing our service. We look forward to serving you.
          //    `
          Emailtemplate(user_name, password, email, subject);
        }
      } else {
        const data = userDataCheck.rows[0];
        const subject = "Successfully Enrolled";

        // res.json({ error: true, data, message: "Email Already Exist" });
        const user_id = userDataCheck.rows[0].user_id;
        const userProgramData = await pool.query(
          "INSERT INTO req_programs(user_id,program_id,package_id) VALUES($1,$2,$3) returning *",
          [user_id, program_id, package_id]
        );
        const dataProg = userProgramData.rows[0];
        res.json({
          error: false,
          data,
          dataProg,
          message: "Course Added Successfully",
        });
        EmailLinkButton(user_name, email, subject);
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.paymentRequestCreate = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { full_name, email, whatsapp_number, screenshot } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide User Email" });
    } else {
        const status="Pending"
      const userData = await pool.query(
        "INSERT INTO payment_request(full_name,email,whatsapp_number,screenshot,status) VALUES($1,$2,$3,$4,$5) returning *",
        [full_name, email, whatsapp_number, screenshot, status]
      );
      const data = userData.rows[0];
      if (userData.rows.length === 0) {
        res.json({ error: true, data, message: "Can't Send Your request Right Now!" });
      } else {
       
        res.json({
          error: false,
          data,
          message: "Request Submitted Successfully",
        });
        
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.paymentRequestGet = async (req, res) => {
    const client = await pool.connect();
    try {
      const query = "SELECT * FROM payment_request ORDER BY created_at DESC";
      const result = await pool.query(query);
      if (result.rows) {
        res.json({
          message: "All Request Fetched",
          error: false,
          result: result.rows,
        });
      } else {
        res.json({
          message: "could not fetch",
          error: true,
        });
      }
    } catch (err) {
      console.log(err);
      res.json({
        message: "Error Occurred",
        status: false,
        error: err.message,
      });
    } finally {
      client.release();
    }
  };
  exports.paymentRequestStatusUpdate = async (req, res) => {
    const client = await pool.connect();
    try {
      const { payment_request_id } = req.body;
      const status="Completed"
      // const company_user = false;
      if (payment_request_id === null || payment_request_id === "" || payment_request_id === undefined) {
        res.json({ error: true, message: "Please Provide User Id" });
      } else {
        let query = "UPDATE payment_request SET ";
        let index = 2;
        let values = [payment_request_id];
  
        
        if (status) {
          query += `status = $${index} , `;
          values.push(status);
          index++;
        }
        query += "WHERE payment_request_id = $1 RETURNING*";
        query = query.replace(/,\s+WHERE/g, " WHERE");
  
        const result = await pool.query(query, values);
  
        if (result.rows.length === 0) {
          res.json({ error: true, data: [], message: "Something went wrong" });
        } else {
          res.json({
            error: false,
            data: result.rows,
            message: "Request Completed Successfully",
          });
        }
      }
    } catch (err) {
      res.json({ error: true, data: [], message: "Catch eror" });
    } finally {
      client.release();
    }
  };
exports.checkEmailUser = async (req, res, next) => {
  const client = await pool.connect();
  try {
    console.log("enroled 1");
    let password = generateRandomPassword(10);

    const { email, program_id, package_id } = req.body;
    let user_name = email.split("@")[0];

    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide User Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

      if (userDataCheck.rows.length === 0) {
        const salt = "mySalt";
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password + salt)
          .digest("hex");
        const userData = await pool.query(
          "INSERT INTO users(user_name,email,password,status) VALUES($1,$2,$3,$4) returning *",
          [user_name, email, hashedPassword, "active"]
        );
        let data = userData.rows[0];
        if (userData.rows.length === 0) {
          res.json({ error: true, data, message: "Can't Create User" });
        } else {
          // res.json({ error: false, password: password, data, message: "User Created Successfully" });
          //   check package and program

          const user_id = data.user_id;
          const userDataCheckD = await pool.query(
            "SELECT * FROM req_programs WHERE user_id=$1 AND program_id=$2 AND package_id=$3",
            [user_id, program_id, package_id]
          );
          if (userDataCheckD.rows.length === 0) {
            const userProgramData = await pool.query(
              "INSERT INTO req_programs(user_id,program_id,package_id) VALUES($1,$2,$3) returning *",
              [user_id, program_id, package_id]
            );
            const dataProg = userProgramData?.rows[0];

            res.json({
              error: false,
              data,
              password: password,
              dataProg,
              message: "User Created Successfully",
            });
            // email send
            const subject = "Welcome Email";
            Emailtemplate(user_name, password, email, subject);
          } else {
            res.json({
              error: false,
              data: userDataCheckD.rows,
              message: "User Program Already Enrolled",
            });
          }
        }
      } else {
        console.log("enroled 2");

        let data = userDataCheck.rows[0];
        // res.json({ error: false, data, message: "Email Already Exist" });
        const user_id = data.user_id;
        const userDataCheckD = await pool.query(
          "SELECT * FROM req_programs WHERE user_id=$1 AND program_id=$2 AND package_id=$3",
          [user_id, program_id, package_id]
        );
        if (userDataCheckD.rows.length === 0) {
          const userProgramData = await pool.query(
            "INSERT INTO req_programs(user_id,program_id,package_id) VALUES($1,$2,$3) returning *",
            [user_id, program_id, package_id]
          );
          const dataProg = userProgramData.rows[0];
          if (userProgramData.rows.length === 0) {
            res.json({
              error: true,
              data,
              message: "Can't Create User Program",
            });
          } else {
            const subject = "Successfully Enrolled";

            console.log("enroled 3");

            res.json({
              error: false,
              data,
              dataProg,
              message: "User Program Created Successfully",
            });
            EmailLinkButton(user_name, email, subject);
          }
        } else {
          console.log("enroled 4");

          res.json({
            error: false,
            data: userDataCheckD.rows,
            message: "User Program Already Enrolled",
          });
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

      if (userDataCheck.rows.length === 0) {
        res.json({
          error: true,
          data: [],
          message: "No User exist for this email",
        });
      } else {
        // login
        const status = userDataCheck.rows[0].status;
        if (status === "inactive") {
          res.json({ error: true, message: "Your Account is Inactive" });
        } else {
          const salt = "mySalt";
          const hashedPasswordFromDb = userDataCheck.rows[0].password;
          const hashedUserEnteredPassword = crypto
            .createHash("sha256")
            .update(password + salt)
            .digest("hex");

          if (hashedPasswordFromDb === hashedUserEnteredPassword) {
            res.json({
              error: false,
              data: userDataCheck.rows[0],
              message: "Login Successfully",
            });
          } else {
            res.json({ error: true, message: "Invalid Credentials" });
          }
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.adminlogin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1 AND type=$2",
        [email, "Admin"]
      );

      if (userDataCheck.rows.length === 0) {
        res.json({
          error: true,
          data: [],
          message: "No User exist for this email",
        });
      } else {
        // login
        const hashedPasswordFromDb = userDataCheck.rows[0].password;

        if (hashedPasswordFromDb === password) {
          res.json({
            error: false,
            data: userDataCheck.rows[0],
            message: "Login Successfully",
          });
        } else {
          res.json({ error: true, message: "Invalid Credentials" });
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.verifyEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      let user_name = userDataCheck.rows[0].user_name;

      if (userDataCheck.rows.length === 0) {
        res.json({ error: true, message: "Email is not Registered" });
      } else {
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const subject = "Verify Email";
        const message =
          "You have requested to reset your password. Here is your OTP code for password reset.";
        res.json({
          error: false,
          otp: password,
          message: "Email Sent Successfully",
        });
        EmailtemplateOTP(user_name, password, email, subject);
        // user_name, password, email, subject
      }
    }
  } catch (err) {
    res.json({ error: true, data: err, message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.updateUsername = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_name, user_id, status } = req.body;
    // const company_user = false;
    if (user_id === null || user_id === "" || user_id === undefined) {
      res.json({ error: true, message: "Please Provide User Id" });
    } else {
      let query = "UPDATE users SET ";
      let index = 2;
      let values = [user_id];

      if (user_name) {
        query += `user_name = $${index} , `;
        values.push(user_name);
        index++;
      }
      if (status) {
        query += `status = $${index} , `;
        values.push(status);
        index++;
      }
      query += "WHERE user_id = $1 RETURNING*";
      query = query.replace(/,\s+WHERE/g, " WHERE");

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.json({ error: true, data: [], message: "Something went wrong" });
      } else {
        res.json({
          error: false,
          data: result.rows,
          message: "User Updated Successfully",
        });
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.updatePassword = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;
    const salt = "mySalt";
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide Email" });
    } else {
      const query1 = "SELECT * FROM users WHERE email =$1";
      const result1 = await pool.query(query1, [email]);
      if (result1.rows.length === 0) {
        res.json({ error: true, message: "Email Doesnot Exist" });
      } else {
        const user_type = result1.rows[0].type;
        if (user_type === "Admin") {
          let query = "UPDATE users SET ";
          let index = 2;
          let values = [email];

          if (password) {
            query += `password = $${index} , `;
            values.push(password);
            index++;
          }
          query += "WHERE email = $1 RETURNING*";
          query = query.replace(/,\s+WHERE/g, " WHERE");
          const result = await pool.query(query, values);

          if (result.rows.length === 0) {
            res.json({
              error: true,
              data: [],
              message: "Something went wrong",
            });
          } else {
            res.json({
              error: false,
              data: result.rows,
              message: "Password Updated Successfully",
            });
          }
        } else {
          let query = "UPDATE users SET ";
          let index = 2;
          let values = [email];

          if (hashedPassword) {
            query += `password = $${index} , `;
            values.push(hashedPassword);
            index++;
          }
          query += "WHERE email = $1 RETURNING*";
          query = query.replace(/,\s+WHERE/g, " WHERE");
          const result = await pool.query(query, values);

          if (result.rows.length === 0) {
            res.json({
              error: true,
              data: [],
              message: "Something went wrong",
            });
          } else {
            res.json({
              error: false,
              data: result.rows,
              message: "Password Updated Successfully",
            });
          }
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.updatePasswordLogedIn = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, current_password, new_pasword } = req.body;
    const salt = "mySalt";
    const hashedPasswordOld = crypto
      .createHash("sha256")
      .update(current_password + salt)
      .digest("hex");
    // const company_user = false;
    if (user_id === null || user_id === "" || user_id === undefined) {
      res.json({ error: true, message: "Please Provide user_id" });
    } else {
      const query1 = "SELECT * FROM users WHERE user_id =$1";
      const result1 = await pool.query(query1, [user_id]);
      if (result1.rows.length === 0) {
        res.json({ error: true, message: "user Doesnot Exist" });
      } else {
        const hashedPasswordFromDb = result1.rows[0].password;
        if (hashedPasswordFromDb === hashedPasswordOld) {
          const hashedPasswordNew = crypto
            .createHash("sha256")
            .update(new_pasword + salt)
            .digest("hex");
          let query = "UPDATE users SET ";
          let index = 2;
          let values = [user_id];

          if (hashedPasswordNew) {
            query += `password = $${index} , `;
            values.push(hashedPasswordNew);
            index++;
          }
          query += "WHERE user_id = $1 RETURNING*";
          query = query.replace(/,\s+WHERE/g, " WHERE");
          const result = await pool.query(query, values);

          if (result.rows.length === 0) {
            res.json({
              error: true,
              data: [],
              message: "Something went wrong",
            });
          } else {
            res.json({
              error: false,
              data: result.rows,
              message: "Password Updated Successfully",
            });
          }
        } else {
          res.json({ error: true, message: "Invalid Current Password" });
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.updatePasswordLogedInAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, current_password, new_pasword } = req.body;

    // const company_user = false;
    if (user_id === null || user_id === "" || user_id === undefined) {
      res.json({ error: true, message: "Please Provide user_id" });
    } else {
      const query1 = "SELECT * FROM users WHERE user_id =$1";
      const result1 = await pool.query(query1, [user_id]);
      if (result1.rows.length === 0) {
        res.json({ error: true, message: "user Doesnot Exist" });
      } else {
        const hashedPasswordFromDb = result1.rows[0].password;
        if (hashedPasswordFromDb === current_password) {
          let query = "UPDATE users SET ";
          let index = 2;
          let values = [user_id];

          if (new_pasword) {
            query += `password = $${index} , `;
            values.push(new_pasword);
            index++;
          }
          query += "WHERE user_id = $1 RETURNING*";
          query = query.replace(/,\s+WHERE/g, " WHERE");
          const result = await pool.query(query, values);

          if (result.rows.length === 0) {
            res.json({
              error: true,
              data: [],
              message: "Something went wrong",
            });
          } else {
            res.json({
              error: false,
              data: result.rows,
              message: "Password Updated Successfully",
            });
          }
        } else {
          res.json({ error: true, message: "Invalid Current Password" });
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.admingetAllCustomers = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, type } = req.body;
    if (type === null || type === undefined || type === "") {
      // when type null show only admin
      const query = "SELECT * FROM users WHERE type =$1";
      const result = await pool.query(query, ["admin"]);
      // get messages
      const Data = result.rows;
      let Array = [];
      for (let i = 0; i < Data.length; i++) {
        const customerId = Data[i].user_id;
        const queryText = `
                SELECT sender = $1 AS from_self, message AS message,type AS type,
                readStatus AS readStatus,
                created_at AS created_at
                FROM messages
                WHERE (sender = $1 AND to_user = $2) OR (sender = $2 AND to_user = $1)
                ORDER BY created_at ASC 
              `;

        let resultMessages = await client.query(queryText, [
          user_id,
          customerId,
        ]);
        // Filter the array to get objects with readstatus false and from_self false
        const filteredResults = resultMessages.rows.filter((row) => {
          return row.readstatus === "false" && row.from_self === false;
        });
        Array.push({
          user_id: Data[i].user_id,
          uniq_id: Data[i].uniq_id,
          user_name: Data[i].user_name,
          otp: Data[i].otp,
          verifyStatus: Data[i].verifyStatus,
          otpExpires: Data[i].otpExpires,
          type: Data[i].type,
          email: Data[i].email,
          unreadMessages: filteredResults.length,
        });
      }

      if (result.rows) {
        res.json({
          message: "All Users Fetched",
          status: true,
          result: Array,
        });
      } else {
        res.json({
          message: "could not fetch",
          status: false,
        });
      }
    } else {
      // type admin (show all users )
      const query = "SELECT * FROM users WHERE user_id <> $1";
      const result = await pool.query(query, [user_id]);
      // get messages
      const Data = result.rows;
      let Array = [];
      for (let i = 0; i < Data.length; i++) {
        const customerId = Data[i].user_id;
        const queryText = `
                SELECT sender = $1 AS from_self, message AS message,type AS type,
                readStatus AS readStatus,
                created_at AS created_at
                FROM messages
                WHERE (sender = $1 AND to_user = $2) OR (sender = $2 AND to_user = $1)
                ORDER BY created_at ASC 
              `;

        let resultMessages = await client.query(queryText, [
          user_id,
          customerId,
        ]);
        // Filter the array to get objects with readstatus false and from_self false
        const filteredResults = resultMessages.rows.filter((row) => {
          return row.readstatus === "false" && row.from_self === false;
        });
        Array.push({
          user_id: Data[i].user_id,
          email: Data[i].email,
          password: Data[i].password,
          image: Data[i].image,
          user_name: Data[i].user_name,
          uniq_id: Data[i].uniq_id,
          unreadMessages: filteredResults.length,
        });
      }

      if (result.rows) {
        res.json({
          message: "All Users Fetched",
          status: true,
          result: Array,
        });
      } else {
        res.json({
          message: "could not fetch",
          status: false,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
exports.getAllCustomers = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = "SELECT * FROM users ORDER BY created_at DESC";
    const result = await pool.query(query);
    let UpdatedArray = [];
    let Array = result.rows;
    for (let i = 0; i < Array.length; i++) {
      const UserId = Array[i].user_id;
      const query1 = "SELECT * FROM req_programs WHERE user_id=$1 ";
      const result1 = await pool.query(query1, [UserId]);
      let SubscriptionCount = result1.rows.length;
      let ObjectData;
      if (Array[i].type !== "Admin") {
        ObjectData = {
          user_id: Array[i].user_id,
          user_name: Array[i].user_name,
          email: Array[i].email,
          created_at: Array[i].created_at,
          updated_at: Array[i].updated_at,
          type: Array[i].type,
          status: Array[i].status,
          subscribedProducts: SubscriptionCount,
        };
        UpdatedArray.push(ObjectData);
      }
    }
    if (result.rows) {
      res.json({
        message: "All Users Fetched",
        status: true,
        result: UpdatedArray,
      });
    } else {
      res.json({
        message: "could not fetch",
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};

exports.getUserByEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;
    //    const type="admin"
    const query = "SELECT * FROM users WHERE email =$1 ";
    const result = await pool.query(query, [email]);
    // get messages
    // const Data= result.rows

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "User Get Success",
        status: true,
        result: result.rows[0],
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
exports.getUserByUniqId = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    console.log(user_id)
    //    const type="admin"
    const query = "SELECT * FROM users WHERE user_id =$1 ";
    const result = await pool.query(query, [user_id]);

    const query1 = "SELECT * FROM req_programs WHERE user_id =$1";
    const result1 = await pool.query(query1, [user_id]);
    console.log(result1.rows)
    // get messages
    // const Data= result.rows
    let Array = [];
    for (let i = 0; i < result1.rows.length; i++) {
    //   const program_id = result1.rows[i].program_id;
      const package_id = result1.rows[i].package_id;

      console.log("not exist ");
    //   const query2 = "SELECT * FROM programs WHERE program_id =$1";
    //   const result2 = await pool.query(query2, [program_id]);

      const query4 = "SELECT * FROM packages WHERE package_id =$1";
      const result4 = await pool.query(query4, [package_id]);
      const query5 =
        "SELECT * FROM user_progress WHERE course_id =$1 AND user_id=$2";
      const result5 = await pool.query(query5, [package_id, user_id]);
      const query6 = "SELECT * FROM product_videos WHERE package_id =$1";
      const result6 = await pool.query(query6, [package_id]);
      const TotalVideos = result6.rows.length;
      const userWatchedVideos = result5.rows.length;
      const percentage = (userWatchedVideos / TotalVideos) * 100;
      // console.log(result2.rows)
      Array.push({
        // program_name: result2.rows[0].title,
        // program_id: result2.rows[0].program_id,
        // description: result2.rows[0].description,
        // image: result2.rows[0].image,
        package_id: result4.rows[0].package_id,
        package_name: result4.rows[0].package_name,
        price: result4.rows[0].package_price,
        package_image: result4.rows[0].image,
        package_description: result4.rows[0].description,
        user_progress: percentage,
        user_watched_videos: result5.rows.length,
        total_videos: result6.rows.length,
      });

      // result1.rows[i].program_name=result2.rows[0].program_name
    }

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "All Users Fetched",
        status: true,
        result: result.rows[0],
        active_subscriptions: Array,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};

exports.logout = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    // const company_user = false;
    if (!user_id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.user_id);
    res.json({ error: false, message: "Logout Successfully" });
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
// cancel Subscription Req
exports.cancelSubscriptionReq = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { subscription_id, reason } = req.body;
    // const company_user = false;
    if (
      subscription_id === null ||
      subscription_id === "" ||
      subscription_id === undefined
    ) {
      res.json({ error: true, message: "Please Provide Subscription Id" });
    } else {
      const userData = await pool.query(
        "INSERT INTO cancel_subscription_req(subscription_id,reason) VALUES($1,$2) returning *",
        [subscription_id, reason]
      );
      const data = userData.rows[0];
      if (userData.rows.length === 0) {
        res.json({
          error: true,
          data,
          message: "Can't submit Reason Right Now !",
        });
      } else {
        res.json({
          error: false,
          data,
          message: "Admin wil get back to you via Email for further process",
        });
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.getSubscriptionCancelRequests = async (req, res) => {
  const client = await pool.connect();
  try {
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query = "SELECT * FROM cancel_subscription_req ";
    const result = await pool.query(query);
    const length = result.rows.length;

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "User Get Success",
        status: true,
        subscriptionResult: result.rows,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
// ProductDetailedSubscriptionAdd when purchased added from admin
exports.ProductDetailedSubscriptionAdd = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { subscription_id, subscription_detail_product } = req.body;
    // const company_user = false;
    if (
      subscription_id === null ||
      subscription_id === "" ||
      subscription_id === undefined
    ) {
      res.json({ error: true, message: "Please Provide Subscription Id" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM subscriptions WHERE subscription_id=$1",
        [subscription_id]
      );

      if (userDataCheck.rows.length === 0) {
        res.json({ error: true, message: "Subscription Doesnot Exist" });
      } else {
        const userData = await pool.query(
          "INSERT INTO subscription_prod_detail(subscription_id,subscription_detail_product) VALUES($1,$2) returning *",
          [subscription_id, subscription_detail_product]
        );
        let User_id = userDataCheck.rows[0].user_id;
        if (userData.rows.length === 0) {
          res.json({
            error: true,
            data: userData.rows[0],
            message: "Can't Add Detail Right Now !",
          });
        } else {
          let Array = userData.rows[0];
          const userCheck = await pool.query(
            "SELECT * FROM users WHERE user_id=$1",
            [User_id]
          );

          if (userCheck.rows.length === 0) {
            res.json({
              error: true,
              data: userCheck.rows,
              message: "User Doesnot Exist!",
            });
          } else {
            const resetLink = login_url;
            const email = userCheck.rows[0].email;
            const subject = "Subscription Detail Added";
            const message =
              "Got your Ip .Login to your account to see the detail";
            res.json({
              error: false,
              data: Array,
              message: "Detail Added and email sent successfully",
            });
            Emailtemplate(email, resetLink, subject, message);
          }
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
// delete
exports.DeleteUserSubscripedProductsDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    const query =
      "DELETE FROM subscription_prod_detail WHERE subscription_prod_detail_id = $1";

    const result = await pool.query(query, [
      req.body.subscription_prod_detail_id,
    ]);

    // Check if any rows were deleted
    if (result.rowCount === 0) {
      res.json({ error: true, message: "Cannot Delete" });
    } else {
      res.json({ error: false, message: " Deleted Successfully" });
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
// Get user subscription Details
exports.getUserSubscripedProductsDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    const { subscription_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query =
      "SELECT * FROM subscription_prod_detail WHERE subscription_id =$1";
    const result = await pool.query(query, [subscription_id]);

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "Details Get succssfully",
        error: false,
        subscriptionResult: result.rows,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
// get User subscriptions

exports.getUserSubscripedProducts = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query = "SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2";
    const result = await pool.query(query, [user_id, "active"]);
    const length = result.rows.length;
    let ArrayData = [];
    if (length === 0) {
    } else {
      for (let i = 0; i < length; i++) {
        const query1 = "SELECT * FROM products WHERE product_id =$1 ";
        const result1 = await pool.query(query1, [result.rows[i].product_id]);
        const product = result1.rows[0];
        const query2 = "SELECT * FROM packages WHERE package_id =$1 ";
        const result2 = await pool.query(query2, [result.rows[i].price_id]);
        const package = result2.rows[0];
        let object = {
          product: product,
          package: package,
          subscription: result.rows[i],
        };

        ArrayData.push(object);
      }
    }
    // get messages
    // const Data= result.rows

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "User Get Success",
        status: true,
        subscriptionResult: ArrayData,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};

// get paginated subscribed products
// exports.getUserSubscripedProducts = async (req, res) => {
//     const client = await pool.connect();
//     try {
//       const { user_id, rowsPerPage, page } = req.body;
//       const offset = (page - 1) * rowsPerPage;
//       const query = `
//         SELECT * FROM subscriptions
//         WHERE user_id = $1 AND status = $2
//         ORDER BY created_at DESC
//         LIMIT $3 OFFSET $4
//       `;
//       const result = await pool.query(query, [user_id, "active", rowsPerPage, offset]);
//       const length = result.rows.length;
//       let ArrayData = [];
//       if (length === 0) {
//         // Handle empty result
//       } else {
//         for (let i = 0; i < length; i++) {
//           const query1 = 'SELECT * FROM products WHERE product_id =$1 ';
//           const result1 = await pool.query(query1, [result.rows[i].product_id]);
//           const product = result1.rows[0];
//           const query2 = 'SELECT * FROM packages WHERE package_id =$1 ';
//           const result2 = await pool.query(query2, [result.rows[i].price_id]);
//           const package = result2.rows[0];
//           let object = {
//             product: product,
//             package: package,
//             subscription: result.rows[i]
//           };
//           ArrayData.push(object);
//         }
//       }
//       if (result.rows.length === 0) {
//         res.json({
//           message: "could not fetch",
//           error: true,
//         });
//       } else {
//         res.json({
//           message: "User Get Success",
//           status: true,
//           subscriptionResult: ArrayData,
//           count:ArrayData.length
//         });
//       }
//     } catch (err) {
//       console.log(err);
//       res.json({
//         message: "Error Occurred",
//         status: false,
//         error: err.message
//       });
//     } finally {
//       client.release();
//     }
//   };

exports.getUserSubscripedProductSingle = async (req, res) => {
  const client = await pool.connect();
  try {
    const { subscription_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query = "SELECT * FROM subscriptions WHERE subscription_id=$1";
    const result = await pool.query(query, [subscription_id]);
    const length = result.rows.length;
    let ArrayData = [];
    if (length === 0) {
    } else {
      const productId = result.rows[0].product_id;
      const priceId = result.rows[0].price_id;

      const query1 = "SELECT * FROM products WHERE product_id =$1 ";
      const result1 = await pool.query(query1, [productId]);
      const product = result1.rows[0];
      const query2 = "SELECT * FROM packages WHERE package_id =$1 ";
      const result2 = await pool.query(query2, [priceId]);
      const package = result2.rows[0];
      let object = {
        product: product,
        package: package,
        subscription: result.rows,
      };

      ArrayData.push(object);
    }

    // get messages
    // const Data= result.rows

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "User Get Success",
        status: true,
        subscriptionResult: ArrayData,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
exports.cardsCountGetDashboard = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query = "SELECT * FROM subscriptions WHERE user_id=$1 AND status=$2";
    const result = await pool.query(query, [user_id, "active"]);
    const length = result.rows.length;

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      // get mo0nthly and yearly subscription
      const queryMonth =
        "SELECT * FROM subscriptions WHERE user_id=$1 AND status=$2 AND type=$3";
      const resultMonth = await pool.query(queryMonth, [
        user_id,
        "active",
        "month",
      ]);
      const lengthMonth = resultMonth.rows.length;

      const queryYear =
        "SELECT * FROM subscriptions WHERE user_id=$1 AND status=$2 AND type=$3";
      const resultYear = await pool.query(queryYear, [
        user_id,
        "active",
        "year",
      ]);
      const lengthYear = resultYear.rows.length;
      res.json({
        message: "Dashboard Success",
        status: true,
        total_subscriptions: length,
        monthly_subscription: lengthMonth,
        yearly_subscription: lengthYear,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
// help and support

exports.helpAndSupportMessage = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      user_id,
      email,
      name,
      message,
      type,
      subscription_id,
      reason,
      subject,
    } = req.body;
    // const company_user = false;
    if (email === null || email === "" || email === undefined) {
      res.json({ error: true, message: "Please Provide User Email" });
    } else {
      const userDataCheck = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      if (userDataCheck.rows.length === 0) {
        // const data = userDataCheck.rows[0]
        res.json({ error: true, data: [], message: "Email Doesn't Exist" });
      } else {
        const status = "open";
        const userData = await pool.query(
          "INSERT INTO help_and_support(user_id,email,name,message,type,status,subject,subscription_id,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *",
          [
            user_id,
            email,
            name,
            message || null,
            type,
            status,
            subject,
            subscription_id || null,
            reason || null,
          ]
        );
        if (userData.rows.length === 0) {
          res.json({ error: true, data: [], message: "Can't Send Message" });
        } else {
          const data = userData.rows[0];

          res.json({ error: false, data, message: "Mesage Sent Successfully" });

          const subject = "Ticket Created";
          const resetLink = login_url_admin;
          const password = "00";
          const buttonText = "Admin Panel";
          const email = admin_email;
          const message =
            "A new support ticket has been created by a user. Login to view details";
          EmailLinkButton(
            email,
            resetLink,
            buttonText,
            subject,
            password,
            message
          );
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};
exports.helpAndSupportMessageUpdateStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { help_and_support_id, status } = req.body;
    // const Contact_user = false;
    if (
      help_and_support_id === null ||
      help_and_support_id === "" ||
      help_and_support_id === undefined
    ) {
      res.json({ error: true, message: "Please Provide contact Id" });
    } else {
      const query1 =
        "SELECT * FROM help_and_support WHERE help_and_support_id=$1";
      const result1 = await pool.query(query1, [help_and_support_id]);

      if (result1.rows.length === 0) {
        res.json({ error: true, message: "Ticket Not Found" });
      } else {
        let email = result1.rows[0].email;
        let query = "UPDATE help_and_support SET ";
        let index = 2;
        let values = [help_and_support_id];

        if (status) {
          query += `status = $${index} , `;
          values.push(status);
          index++;
        }
        query += "WHERE help_and_support_id = $1 RETURNING*";
        query = query.replace(/,\s+WHERE/g, " WHERE");

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
          res.json({ error: true, data: [], message: "Something went wrong" });
        } else {
          res.json({
            error: false,
            data: result.rows,
            message: "Updated Status Successfully",
          });
          // Send email to user
          const subject = `Ticket ${status}`;
          const resetLink = login_url;
          const password = "00";
          const buttonText = "User Panel";
          const message = `Your ticket is ${status} .Login to check the status .`;
          EmailLinkButton(
            email,
            resetLink,
            buttonText,
            subject,
            password,
            message
          );
        }
      }
    }
  } catch (err) {
    res.json({ error: true, data: [], message: "Catch eror" });
  } finally {
    client.release();
  }
};

exports.getAllHelpAndSupport = async (req, res) => {
  const client = await pool.connect();
  try {
    //    const type="admin"
    const query = "SELECT * FROM help_and_support ORDER BY created_at DESC";
    const result = await pool.query(query);
    if (result.rows) {
      res.json({
        message: "All FAQS Fetched",
        status: true,
        result: result.rows,
      });
    } else {
      res.json({
        message: "could not fetch",
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
exports.getAllHelpAndSupportByUserId = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    //    const type="admin"
    const query =
      "SELECT * FROM help_and_support WHERE user_id=$1 ORDER BY created_at DESC";
    const result = await pool.query(query, [user_id]);
    if (result.rows) {
      res.json({
        message: "All Help And Support Fetched",
        status: true,
        result: result.rows,
      });
    } else {
      res.json({
        message: "could not fetch",
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
// start
exports.getUserSubscripedByProductId = async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, user_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query =
      "SELECT * FROM subscriptions WHERE product_id=$1 AND user_id=$2 Order By subscription_id DESC";
    const result = await pool.query(query, [product_id, user_id]);
    let Array = [];
    for (let i = 0; i < result.rows.length; i++) {
      const query1 = "SELECT * FROM users WHERE user_id =$1 ";
      const result1 = await pool.query(query1, [result.rows[i].user_id]);
      const user = result1.rows[0];
      let object = {
        user: user,
        subscription: result.rows[i],
      };
      Array.push(object);
    }

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "User Get Success",
        error: false,
        subscriptionResult: Array,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
exports.getUserSubscripedByUserId = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    //    const type="admin"
    // const query = 'SELECT * FROM subscriptions WHERE user_id =$1 AND status=$2 '
    const query =
      "SELECT * FROM subscriptions WHERE user_id=$1 Order By created_at DESC";
    const result = await pool.query(query, [user_id]);
    let Array = [];
    for (let i = 0; i < result.rows.length; i++) {
      // console.log(result.rows[i].price_id)
      const query1 = "SELECT * FROM users WHERE user_id =$1 ";
      const result1 = await pool.query(query1, [result.rows[i].user_id]);
      const query2 = "SELECT * FROM products WHERE product_id =$1 ";
      const result2 = await pool.query(query2, [result.rows[i].product_id]);
      const query3 = "SELECT * FROM packages WHERE package_id =$1 ";
      const result3 = await pool.query(query3, [result.rows[i].price_id]);

      const product = result2.rows[0];
      const user = result1.rows[0];
      let object = {
        user: user,
        subscription: result.rows[i],
        product: product,
        price: result3.rows[0],
      };
      Array.push(object);
    }

    if (result.rows.length === 0) {
      res.json({
        message: "could not fetch",
        error: true,
      });
    } else {
      res.json({
        message: "Subscription Get Success",
        error: false,
        subscriptionResult: Array,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
// end
exports.dashboardAdminCount = async (req, res) => {
  const client = await pool.connect();
  try {
    // get mo0nthly and yearly subscription
    // const queryMonth = 'SELECT * FROM subscriptions WHERE type=$1'
    // const resultMonth = await pool.query(queryMonth, ['month']);
    // const lengthMonth = resultMonth.rows.length

    const queryUsers = "SELECT * FROM users ";
    const resultUsers = await pool.query(queryUsers);
    const lengthWithAdmin = resultUsers.rows.length;
    const lengthUsers = parseInt(lengthWithAdmin) - parseInt(1);

    const queryYear = "SELECT * FROM users WHERE status=$1";
    const resultYear = await pool.query(queryYear, ["active"]);
    const lengthYear = resultYear.rows.length;
    const lengthActiveUsers = parseInt(lengthYear) - parseInt(1);

    const queryProducts = "SELECT * FROM users WHERE status=$1 ";
    const resultProducts = await pool.query(queryProducts, ["inactive"]);
    const lengthProducts = resultProducts.rows.length;

    const queryPrograms = "SELECT * FROM programs ";
    const resultPrograms = await pool.query(queryPrograms);
    const lengthPrograms = resultPrograms.rows.length;

    const queryPackage = "SELECT * FROM packages ";
    const resultPackage = await pool.query(queryPackage);
    const lengthPackage = resultPackage.rows.length;

    const queryVideos = "SELECT * FROM product_videos ";
    const resultVideos = await pool.query(queryVideos);
    const lengthVideos = resultVideos.rows.length;

    const queryContact = "SELECT * FROM contact_us WHERE status=$1";
    const resultContact = await pool.query(queryContact, ["pending"]);
    const lengthContact = resultContact.rows.length;

    const queryContactResol = "SELECT * FROM contact_us WHERE status=$1";
    const resultContactResol = await pool.query(queryContactResol, [
      "resolved",
    ]);
    const lengthContactResol = resultContactResol.rows.length;

    const queryContactReject = "SELECT * FROM contact_us WHERE status=$1";
    const resultContactReject = await pool.query(queryContactReject, [
      "rejected",
    ]);
    const lengthContactReject = resultContactReject.rows.length;
    res.json({
      message: "Dashboard Success",
      error: false,
      total_active_users: lengthActiveUsers,
      total_block_users: lengthProducts,
      total_users: lengthUsers,
      total_programs: lengthPrograms,
      total_courses: lengthPackage,
      videos: lengthVideos,
      open_tickets_contact: lengthContact,
      resolved_tickets_contact: lengthContactResol,
      rejected_tickets_contact: lengthContactReject,
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error Occurred",
      status: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};
