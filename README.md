### backend-e-learning-platform
version v1

## live site link
(http://ec2-13-233-195-88.ap-south-1.compute.amazonaws.com/api/v1)

## admin routes
post "/signup" =>  to allow admin to signup
post "/login" => to allow admin to login
get "/me" => to get the admin profile details
put "/updateprofile" => to update admin profile detail i.e. name, password, profile_picture
post "/courses => to create course
put "/courses/:courseId => to update course
get "/courses?category=technology&page=2 => to get all courses
get "/mypublishedcourses?page=2 => to get admin specific published courses
get "/course/:courseId => to get particular course of the admin
delete "/course/:courseId => to delete a particular course

## user routes
post "/signup" to allow user to signup
post "/login" to allow user to login
get "/me" to allow user to get user profile details
put "/updateprofile" to allow user update user profile detail i.e. name, password, profile_picture
get "/courses?category=technology&page=2" to allow user to get all courses
post "/courses/:courseId" to allow user to purchase a specific course
get "/purchasedCourses?page=1" to allow user to see his all purchased courses

## env variables
POSTGRES_URL
PORT
CLOUD_NAME
CLOUD_KEY
CLOUD_KEY_SECRET
RESEND_API_KEY

