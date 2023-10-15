



//TODO: Can be used for storing traits and debugging information for things like sentry

class Analytics {


  debug(...data: any[]) {
    if (import.meta.env.DEV) {
      console.debug('[AucctusApp]', data)
    }
  }

  log(...data: any[]) {
    console.log(data)
  }

}


const analytics = new Analytics()


export default analytics;