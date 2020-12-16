import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, Renderer2, AfterViewInit, ViewChildren } from '@angular/core';
import { ApiService } from 'app/api.service';
import * as Chartist from 'chartist';
import * as MyLegend from 'chartist-plugin-legend';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient, private apiService: ApiService, private renderer: Renderer2) 
  { 
    var tester = new MyLegend();
  }
  
  
  numbers: any = {movies: 0, accounts: 0, chains: 0, cinemas: 0}
  topReviewedMovies: any = {series: [], labels: [], lastReview: null} 
  behaviors: any = {reviews: [], labels: [], orders: [], most: null, maxCount: 0} 
  activities: any = {movies: [], accounts: [], admins: []}

  @ViewChildren('topReviewed') topReviewedChart: QueryList<ElementRef>;
  @ViewChildren('languageChart') languagesChart: QueryList<ElementRef>;
  @ViewChildren('behaviorChart') behaviorChart: QueryList<ElementRef>;

  loaded: boolean = false;
  loaded2: boolean = false;

  startAnimationForLineChart(chart){
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function(data) {
      if(data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if(data.type === 'point') {
            seq++;
            data.element.animate({
              opacity: {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
    });

    seq = 0;
  };

  startAnimationForBarChart(chart){
      let seq2: any, delays2: any, durations2: any;

      seq2 = 0;
      delays2 = 80;
      durations2 = 500;
      chart.on('draw', function(data) {
        if(data.type === 'bar'){
            seq2++;
            data.element.animate({
              opacity: {
                begin: seq2 * delays2,
                dur: durations2,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
      });

      seq2 = 0;
  };


  async ngOnInit(): Promise<void> 
  {
    await this.getNumbers();
    await this.getTopReviewedMovies();
    await this.getBehaviors();
    this.loaded = true;
    await this.getActivities();
    this.loaded2 = true;
  }

  async getNumbers()
  {
    let url = this.apiService.backendHost + "/api/Statistics/Numbers";
    this.numbers = await this.http.get<any>(url).toPromise();
  }

  async getTopReviewedMovies()
  {
    let url = this.apiService.backendHost + "/api/Statistics/Top5Reviewed";
    this.topReviewedMovies = await this.http.get<any>(url).toPromise();
  }

  // async getLanguages()
  // {
  //   let url = this.apiService.backendHost + "/api/Statistics/Languages";
  //   this.languages = await this.http.get<any>(url).toPromise();
  // }

  async getBehaviors()
  {
    let url = this.apiService.backendHost + "/api/Statistics/Behaviors";
    this.behaviors = await this.http.get<any>(url).toPromise();
  }

  async getActivities()
  {
    let url = this.apiService.backendHost + "/api/Statistics/Activities";
    this.activities = await this.http.get<any>(url).toPromise();
  }

  initTopReviewedPieChart()
  {
    const data: any = {
      labels: this.topReviewedMovies.labels,
      series: this.topReviewedMovies.series };

    const options: any = {
      donut: false,
      donutWidth: 15,
      showLabel: false,
      plugins: [ Chartist.plugins.legend({position: 'bottom'})  ]
    }

    var chart = new Chartist.Pie('#topReviewedMovies', data, options);
  }

  // initLanguagesBarChart()
  // {
  //   var data = {
  //     labels: this.languages.labels,
  //     series: [this.languages.series]
  //   };
  //   let sum = 0;
  //   this.languages.series.forEach((s: number) => sum += s)
  //   var options = 
  //   {
  //     axisX: { showGrid: false },
  //     low: 0,
  //     high: sum,
  //     chartPadding: { top: 0, right: 5, bottom: 0, left: 0},
  //     plugins: [ Chartist.plugins.legend({position: 'bottom'})  ]
  //   };
  //   var responsiveOptions: any[] = [
  //     ['screen and (max-width: 640px)', {
  //       seriesBarDistance: 5,
  //       axisX: { labelInterpolationFnc: function (value) { return value[0]; } }
  //     }]
  //   ];
  //   var chart = new Chartist.Bar('#languagesChart', data, options, responsiveOptions);
  //   this.startAnimationForBarChart(chart);
  // }

  initBehaviorLineChart()
  {
    const data: any = {
      labels: this.behaviors.labels,
      series: [this.behaviors.reviews, this.behaviors.orders]
    };

    const options: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0
        }),
        low: 0,
        high: this.behaviors.maxCount + 10, 
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
        plugins: [ Chartist.plugins.legend({position: 'bottom', legendNames: ['Hoạt động đánh giá phim', 'Hoạt động mua vé'] })  ]
    }

    var chart = new Chartist.Line('#behaviorChart', data, options);
    this.startAnimationForLineChart(chart);
  }
  ngAfterViewInit(): void 
  {
    this.topReviewedChart.changes.subscribe(c => { c.toArray().forEach((item: ElementRef) => 
      { 
        this.initTopReviewedPieChart();
      }) 
    });

    this.behaviorChart.changes.subscribe(c => { c.toArray().forEach((item: ElementRef) => 
      { 
        this.initBehaviorLineChart();
      }) 
    });
    
  }

  calculateDiff(date: string): string
  {
    let d2: Date = new Date();
    let d1 = new Date(date);
    var diffMs = d2.getTime() - d1.getTime();
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    if (diffDays > 0) return diffDays + " ngày trước";
    if (diffHrs > 0) return diffHrs + " giờ trước";
    if (diffMins > 0) return diffMins + " phút trước";
    else return "Vừa xong";
  }

}
