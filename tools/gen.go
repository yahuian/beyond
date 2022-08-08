package main

import (
	_ "embed"
	"flag"
	"fmt"
	"os"
	"path"
	"text/template"

	"github.com/yahuian/gox/filex"
)

//go:embed list.txt
var listTemplate string

//go:embed create.txt
var createTemplate string

//go:embed delete.txt
var deleteTemplate string

type Meta struct {
	Model   string
	Service string
}

func main() {
	var meta Meta
	var dst string
	flag.StringVar(&meta.Model, "model", "", "model struct name")
	flag.StringVar(&meta.Service, "service", "", "service package name")
	flag.StringVar(&dst, "dst", "", "result files dst")
	flag.Parse()

	exist, err := filex.Exist(dst)
	if err != nil {
		panic(err)
	}
	if exist {
		panic(fmt.Sprintf("%s already exists", dst))
	}
	if err := os.MkdirAll(dst, 0775); err != nil {
		panic(err)
	}

	params := map[string]string{
		listTemplate:   path.Join(dst, "list.go"),
		createTemplate: path.Join(dst, "create.go"),
		deleteTemplate: path.Join(dst, "delete.go"),
	}

	for k, v := range params {
		tmp, err := template.New(k).Parse(k)
		if err != nil {
			panic(err)
		}
		f, err := os.Create(v)
		if err != nil {
			panic(err)
		}
		if err := tmp.Execute(f, meta); err != nil {
			panic(err)
		}
	}
}
