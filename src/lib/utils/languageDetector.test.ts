import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  getLanguageFromExtension,
  getLanguageDisplayName,
} from './languageDetector';

describe('Language Detector', () => {
  describe('detectLanguage', () => {
    it('returns null for empty string', () => {
      expect(detectLanguage('')).toBeNull();
      expect(detectLanguage('   ')).toBeNull();
    });

    it('returns null for low confidence matches', () => {
      expect(detectLanguage('hello world')).toBeNull();
    });

    describe('TypeScript detection', () => {
      it('detects TypeScript with interface', () => {
        const code = `
          interface User {
            id: number;
            name: string;
          }
        `;
        expect(detectLanguage(code)).toBe('typescript');
      });

      it('detects TypeScript with type annotation', () => {
        const code = `
          interface Props {
            value: string;
            count: number;
          }
          function greet(name: string): void {
            console.log(name);
          }
        `;
        expect(detectLanguage(code)).toBe('typescript');
      });

      it('detects TypeScript with type alias', () => {
        const code = `
          type Status = 'pending' | 'completed';
          const status: Status = 'pending';
        `;
        expect(detectLanguage(code)).toBe('typescript');
      });
    });

    describe('JavaScript detection', () => {
      it('detects JavaScript with const/let', () => {
        const code = `
          const name = 'John';
          let count = 0;
          function sayHello() {
            console.log('Hello');
          }
        `;
        expect(detectLanguage(code)).toBe('javascript');
      });

      it('detects JavaScript with arrow functions', () => {
        const code = `
          const add = (a, b) => {
            return a + b;
          };
          const square = x => x * x;
        `;
        expect(detectLanguage(code)).toBe('javascript');
      });

      it('detects JavaScript with require/exports', () => {
        const code = `
          const fs = require('fs');
          module.exports = { myFunction };
        `;
        expect(detectLanguage(code)).toBe('javascript');
      });
    });

    describe('Python detection', () => {
      it('detects Python with def function', () => {
        const code = `
          def hello(name):
              print(f"Hello, {name}")
              return True
        `;
        expect(detectLanguage(code)).toBe('python');
      });

      it('detects Python with class', () => {
        const code = `
          class User:
              def __init__(self, name):
                  self.name = name

              def greet(self):
                  print(f"Hello, {self.name}")
        `;
        expect(detectLanguage(code)).toBe('python');
      });

      it('detects Python with imports', () => {
        const code = `
          import os
          from typing import List, Optional

          if __name__ == "__main__":
              print("Running")
        `;
        expect(detectLanguage(code)).toBe('python');
      });
    });

    describe('Rust detection', () => {
      it('detects Rust with fn and let mut', () => {
        const code = `
          fn main() {
              let mut count = 0;
              println!("Hello, world!");
          }
        `;
        expect(detectLanguage(code)).toBe('rust');
      });

      it('detects Rust with impl', () => {
        const code = `
          pub struct User {
              name: String,
          }

          impl User {
              pub fn new(name: &str) -> Self {
                  User { name: name.to_string() }
              }
          }
        `;
        expect(detectLanguage(code)).toBe('rust');
      });
    });

    describe('Go detection', () => {
      it('detects Go with package and func', () => {
        const code = `
          package main

          import "fmt"

          func main() {
              fmt.Println("Hello")
          }
        `;
        expect(detectLanguage(code)).toBe('go');
      });

      it('detects Go with := shorthand', () => {
        const code = `
          func example() {
              name := "John"
              count := 42
              fmt.Printf("%s: %d", name, count)
          }
        `;
        expect(detectLanguage(code)).toBe('go');
      });
    });

    describe('Java detection', () => {
      it('detects Java with public class', () => {
        const code = `
          public class HelloWorld {
              public static void main(String[] args) {
                  System.out.println("Hello, World!");
              }
          }
        `;
        expect(detectLanguage(code)).toBe('java');
      });

      it('detects Java with annotations', () => {
        const code = `
          @Override
          public void processRequest() {
              private String name = "test";
              new ArrayList<String>();
          }
        `;
        expect(detectLanguage(code)).toBe('java');
      });
    });

    describe('C detection', () => {
      it('detects C with #include and main', () => {
        const code = `
          #include <stdio.h>

          int main() {
              printf("Hello, World!");
              return 0;
          }
        `;
        expect(detectLanguage(code)).toBe('c');
      });
    });

    describe('C++ detection', () => {
      it('detects C++ with iostream and std::', () => {
        const code = `
          #include <iostream>

          int main() {
              std::cout << "Hello" << std::endl;
              return 0;
          }
        `;
        expect(detectLanguage(code)).toBe('cpp');
      });

      it('detects C++ with class and template', () => {
        const code = `
          template <typename T>
          class Container {
          public:
              void add(T item) {
                  std::vector<T> items;
              }
          };
        `;
        expect(detectLanguage(code)).toBe('cpp');
      });
    });

    describe('C# detection', () => {
      it('detects C# with using System', () => {
        const code = `
          using System;

          namespace MyApp {
              public class Program {
                  static void Main() {
                      Console.WriteLine("Hello");
                  }
              }
          }
        `;
        expect(detectLanguage(code)).toBe('csharp');
      });
    });

    describe('HTML detection', () => {
      it('detects HTML with tags', () => {
        const code = `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Test</title>
          </head>
          <body>
              <div class="container">Hello</div>
          </body>
          </html>
        `;
        expect(detectLanguage(code)).toBe('html');
      });
    });

    describe('CSS detection', () => {
      it('detects CSS with selectors and properties', () => {
        const code = `
          .container {
              display: flex;
              margin: 0 auto;
              padding: 20px;
          }

          #main {
              background-color: #fff;
          }
        `;
        expect(detectLanguage(code)).toBe('css');
      });
    });

    describe('JSON detection', () => {
      it('detects JSON', () => {
        const code = `
          {
            "name": "John",
            "age": 30,
            "active": true,
            "items": [1, 2, 3]
          }
        `;
        expect(detectLanguage(code)).toBe('json');
      });
    });

    describe('SQL detection', () => {
      it('detects SQL with SELECT FROM', () => {
        const code = `
          SELECT id, name, email
          FROM users
          WHERE active = true
          ORDER BY name ASC;
        `;
        expect(detectLanguage(code)).toBe('sql');
      });

      it('detects SQL with INSERT INTO', () => {
        const code = `
          INSERT INTO users (name, email)
          VALUES ('John', 'john@example.com');
        `;
        expect(detectLanguage(code)).toBe('sql');
      });
    });

    describe('Bash detection', () => {
      it('detects Bash with shebang', () => {
        const code = `
          #!/bin/bash

          echo "Hello"
          for i in 1 2 3; do
              echo $i
          done
        `;
        expect(detectLanguage(code)).toBe('bash');
      });

      it('detects Bash with variables and pipes', () => {
        const code = `
          name="John"
          echo "Hello, $name"
          cat file.txt | grep "pattern" | awk '{print $1}'
        `;
        expect(detectLanguage(code)).toBe('bash');
      });
    });

    describe('Markdown detection', () => {
      it('detects Markdown with headers and lists', () => {
        const code = `
          # Main Title

          This is a paragraph with **bold** text.

          * Item 1
          * Item 2

          [Link](https://example.com)

          \`\`\`javascript
          const x = 1;
          \`\`\`
        `;
        expect(detectLanguage(code)).toBe('markdown');
      });
    });
  });

  describe('getLanguageFromExtension', () => {
    it('returns correct language for common extensions', () => {
      expect(getLanguageFromExtension('file.js')).toBe('javascript');
      expect(getLanguageFromExtension('file.jsx')).toBe('javascript');
      expect(getLanguageFromExtension('file.ts')).toBe('typescript');
      expect(getLanguageFromExtension('file.tsx')).toBe('typescript');
      expect(getLanguageFromExtension('file.py')).toBe('python');
      expect(getLanguageFromExtension('file.rs')).toBe('rust');
      expect(getLanguageFromExtension('file.go')).toBe('go');
      expect(getLanguageFromExtension('file.java')).toBe('java');
      expect(getLanguageFromExtension('file.c')).toBe('c');
      expect(getLanguageFromExtension('file.h')).toBe('c');
      expect(getLanguageFromExtension('file.cpp')).toBe('cpp');
      expect(getLanguageFromExtension('file.cs')).toBe('csharp');
      expect(getLanguageFromExtension('file.html')).toBe('html');
      expect(getLanguageFromExtension('file.css')).toBe('css');
      expect(getLanguageFromExtension('file.json')).toBe('json');
      expect(getLanguageFromExtension('file.sql')).toBe('sql');
      expect(getLanguageFromExtension('file.sh')).toBe('bash');
      expect(getLanguageFromExtension('file.md')).toBe('markdown');
    });

    it('is case insensitive', () => {
      expect(getLanguageFromExtension('file.JS')).toBe('javascript');
      expect(getLanguageFromExtension('file.PY')).toBe('python');
    });

    it('returns null for unknown extensions', () => {
      expect(getLanguageFromExtension('file.xyz')).toBeNull();
      expect(getLanguageFromExtension('file.unknown')).toBeNull();
    });

    it('returns null for files without extension', () => {
      expect(getLanguageFromExtension('Dockerfile')).toBeNull();
    });
  });

  describe('getLanguageDisplayName', () => {
    it('returns correct display names', () => {
      expect(getLanguageDisplayName('javascript')).toBe('JavaScript');
      expect(getLanguageDisplayName('typescript')).toBe('TypeScript');
      expect(getLanguageDisplayName('python')).toBe('Python');
      expect(getLanguageDisplayName('rust')).toBe('Rust');
      expect(getLanguageDisplayName('go')).toBe('Go');
      expect(getLanguageDisplayName('java')).toBe('Java');
      expect(getLanguageDisplayName('c')).toBe('C');
      expect(getLanguageDisplayName('cpp')).toBe('C++');
      expect(getLanguageDisplayName('csharp')).toBe('C#');
      expect(getLanguageDisplayName('html')).toBe('HTML');
      expect(getLanguageDisplayName('css')).toBe('CSS');
      expect(getLanguageDisplayName('json')).toBe('JSON');
      expect(getLanguageDisplayName('sql')).toBe('SQL');
      expect(getLanguageDisplayName('bash')).toBe('Bash');
      expect(getLanguageDisplayName('markdown')).toBe('Markdown');
    });
  });
});
