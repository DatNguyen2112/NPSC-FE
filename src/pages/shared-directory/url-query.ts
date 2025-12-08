export class UrlQuery {
  // Clear element when value empty
  protected isClear: boolean = true

  protected query: Map<string, any> = new Map()

  constructor(init?: string | object) {
    if (typeof init !== 'undefined') {
      if (typeof init === "object") {
        Object.entries(init).forEach(([key, value]) => {
          if (value instanceof Array) {
            this.query.set(key, value)
          } else if (value instanceof Object) {
            const child: Map<string, any> = new Map()

            Object.entries(value as any).forEach(([k2, v2]) => {
              child.set(k2, v2)
            })

            this.query.set(key, child)
          } else {
            this.query.set(key, value)
          }
        })
      } else {
        if (init.indexOf('?') === 0) {
          init = init.slice(1, init.length)
        }

        if (init.length > 0) {
          init.split('&').forEach((v1: string) => {
            const sp1 = v1.split("=")

            if (1 in sp1 && sp1[1] !== null) {
              const sp2 = sp1[1].split("|");

              if (sp2.length >= 2 || sp1[1].indexOf(':') !== -1) {
                const child: Map<string, any> = new Map()

                sp2.forEach((v2: string) => {
                  const sp3 = v2.split(":")

                  if (1 in sp3 && sp3[1] !== null) {
                    child.set(sp3[0], decodeURIComponent(sp3[1]))
                  } else {
                    child.set(sp3[0], '')
                  }
                })

                this.query.set(sp1[0], child)
              } else {
                this.query.set(sp1[0], decodeURIComponent(sp1[1]))
              }
            } else {
              this.query.set(sp1[0], '')
            }
          })
        }
      }
    }
  }

  // public setIsClear = (value: boolean): this => {
  //     this.isClear = value;
  //
  //     return this;
  // }

  public set = (name: string, value: string | number): this => {
    const sp = name.split('.')

    if (sp.length > 1) {
      if (this.has(sp[0])) {
        (this.query.get(sp[0]) as Map<string, any>).set(sp[1], decodeURIComponent(typeof value === 'number' ? value.toString() : value));
      } else {
        this.query.set(sp[0], (new Map()).set(sp[1], decodeURIComponent(typeof value === 'number' ? value.toString() : value)));
      }
    } else {
      this.query.set(name, decodeURIComponent(typeof value === 'number' ? value.toString() : value))
    }

    return this
  }

  public get = (name: string, df: any = ''): any => {
    const sp = name.split('.')

    let value

    if (sp.length > 1) {
      if (this.has(sp[0])) {
        value = (this.query.get(sp[0]) as Map<string, any>).get(sp[1]);
      }
    } else {
      value = this.query.get(name)

      if (value instanceof Map) {
        value = Object.fromEntries(value)
      }
    }

    return value ?? df
  }

  public getInt = (name: string, df: any = 0): number => {
    const value = this.get(name, df)

    if (typeof value === "number") {
      return value
    }

    return parseInt(value)
  }

  public delete = (name: string): this => {
    const sp = name.split('.')

    if (sp.length > 1) {
      if (this.has(sp[0])) {
        (this.query.get(sp[0]) as Map<string, any>).delete(sp[1])
      }
    } else {
      this.query.delete(name)
    }

    return this
  }

  public has = (name: string): boolean => {
    const sp = name.split('.');

    if (sp.length > 1) {
      if (!this.has(sp[0])) {
        return false;
      } else {
        return (this.query.get(sp[0]) as Map<string, any>).has(sp[1]);
      }
    } else {
      return this.query.has(name)
    }
  }

  public toString = (before: string = '?', after: string = ''): string => {
    let value: string[] = []

    this.query.forEach((v1: any, k1: string) => {
      if (v1 instanceof Map) {
        let child: string[] = []

        v1.forEach((v2: any, k2: string) => {
          if (v2.length > 0) {
            child.push(`${k2}:${encodeURIComponent(v2)}`)
          }
        })

        if (child.length > 0) {
          value.push(`${k1}=${child.join('|')}`)
        }
      } else {
        if (v1.length > 0) {
          value.push(`${k1}=${encodeURIComponent(v1)}`)
        }
      }
    })

    if (value.length > 0) {
      return before + value.join('&') + after
    } else {
      return ''
    }
  }

  public toObject = (merge: any = {}): any => {
    const data: any = {}

    this.query.forEach((v1, k1) => {
      if (v1 instanceof Map) {
        let child: any = {}

        v1.forEach((v2: any, k2: string) => {
          if (this.isClear) {
            if (v2) {
              if (v2 instanceof Array) {
                if (v2.length > 0) {
                  child[k2] = v2
                }
              } else if (v2 instanceof Object) {
                if (Object.keys(v2).length > 0) {
                  child[k2] = v2
                }
              } else {
                if (v2.toString().length > 0) {
                  child[k2] = v2
                }
              }
            }
          } else {
            child[k2] = v2
          }
        })

        if (this.isClear) {
          if (Object.keys(child).length > 0) {
            data[k1] = child;
          }
        } else {
          data[k1] = child
        }
      } else {
        if (this.isClear) {
          if (v1.toString().length > 0) {
            data[k1] = v1
          }
        } else {
          data[k1] = v1
        }
      }
    });

    if (typeof merge === "object" && Object.keys(merge).length > 0) {
      return Object.assign(data, merge)
    } else {
      return data
    }
  }

  public forEach = () => this.query.forEach
}
