import { Config } from 'tailwindcss'

export default <Config> {
  content: [
    './{components,layouts,pages}/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      borderRadius: {
        none: '0',
        DEFAULT: '5px', // timer, label, input, btn
        md: '10px' // frame
      },
      colors: {
        blue: {
          500: '#006FD6', // 'go negative' label
          700: '#193E78', // 'update' btn
          900: '#303947' // 'active' btn
        },
        brown: {
          500: '#84661A', // 'continue' btn
          600: '#62562D' // 'create' btn
        },
        gray: {
          100: '#8F8F8F', // text
          200: '#727272', // secundair text
          300: '#606060', // placeholder
          400: '#595959', // clock
          500: '#363636', // input
          700: '#272727', // border
          800: '#1C1C1C', // frame
          900: '#151515' // background
        },
        red: {
          500: '#EC2A2A' // 'stop' label
        },
        white: '#FFFFFF'
      },
      fontSize: {
        sm: '11px', // button, label
        md: '14px', // title, timers
        lg: '18px', // clock
        xl: '22px', // 'clock' label
        xxl: '33px' // 'countdown' clock
      }
    }
  }
}
