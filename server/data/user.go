package data

type User struct {
	Username string `json:"username"`
	Id       string `json:"id"`
}

func CreateUser(username string, id string) *User {
	return &User{Username: username, Id: id}
}
