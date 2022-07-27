package ctx

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yahuian/gox/errorx"
)

type Context struct {
	*gin.Context
}

type HandlerFunc func(c *Context)

func Handle(h HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := &Context{
			c,
		}
		h(ctx)
	}
}

/******************/
/* common request */
/******************/

type Paging struct {
	Page int `form:"page"`
	Size int `form:"size" validate:"max=100"`
}

func (c *Context) Paging() (Paging, error) {
	var param Paging
	if err := c.ShouldBindQuery(&param); err != nil {
		return param, errorx.Wrap(err)
	}
	if param.Page == 0 {
		param.Page = 1
	}
	if param.Size == 0 {
		param.Size = 20
	}
	return param, nil
}

type IDList struct {
	IDS []uint64 `json:"ids" validate:"required"`
}

func (c *Context) GetIDList() (IDList, error) {
	var param IDList
	if err := c.ShouldBindJSON(&param); err != nil {
		return param, errorx.Wrap(err)
	}
	return param, nil
}

/*
Query build and validate query param to struct, struct param is pointer
form tag is query param and json tag is table column name

type Temp struct {
	Name string `form:"name" json:"name"`
	ID   []uint `form:"id[]" json:"id"`
}

query url ?name=tom&id[]=1&id[]=2
will generate ("name = ? AND id IN ?", "tom", []uint(1,2))

created_at is a special tag and every table must have created_at column
see `service/bill/details/list.go` for more example
*/
func (c *Context) Query(structP any) (string, []any, error) {
	if err := c.ShouldBindQuery(structP); err != nil {
		return "", nil, errorx.Wrap(err)
	}

	var (
		query strings.Builder
		args  []any
	)

	t := reflect.TypeOf(structP).Elem()
	v := reflect.ValueOf(structP).Elem()

	for i := 0; i < t.NumField(); i++ {
		val := v.Field(i)
		if reflect.DeepEqual(val.Interface(), reflect.Zero(val.Type()).Interface()) {
			continue
		}

		tag := t.Field(i).Tag.Get("json")

		if tag == "created_at" {
			query.WriteString(fmt.Sprintf("%s BETWEEN ? AND ? AND ", tag))
			t := val.Interface().([]string)
			args = append(args, t[0], t[1])
			continue
		}

		query.WriteString(fmt.Sprintf("%s IN ? AND ", tag))
		args = append(args, val.Interface())
	}

	res := strings.TrimRight(query.String(), "AND ")

	return res, args, nil
}

/*******************/
/* common response */
/*******************/

type Response struct {
	Msg   string `json:"msg"`
	Data  any    `json:"data,omitempty"`
	Count int64  `json:"count,omitempty"`
}

func (c *Context) BadRequest(err error) {
	c.JSON(http.StatusBadRequest, Response{Msg: err.Error()})
}

func (c *Context) InternalErr(err error) {
	c.JSON(http.StatusInternalServerError, Response{Msg: err.Error()})
}

func (c *Context) Success() {
	c.SuccessWith(Response{Msg: "success"})
}

func (c *Context) SuccessWith(r Response) {
	c.JSON(http.StatusOK, r)
}
