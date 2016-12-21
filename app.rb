require 'sinatra'
require 'matrix'
require 'erb'
require 'mongo'
require 'json'

require_relative 'Models/Block.rb'
require_relative 'Models/Weights.rb'

enable :sessions
set :session_secret, '*&(^B234'

get '/' do
  @blocks = Block.new.find_all
  session[:async] = 0

  update_weight_matrix

  erb :index
end

post '/get_image_data' do
  id = params[:id]

  block = Block.new.find_by_id(id)
  {data: block['data']}.to_json
end

post '/add_block' do
  data = params[:data]

  Block.new.add(data)
end

post '/recognize' do
  data = params[:data]

  recognize(data.scan(/-*\d/))
end

def update_weight_matrix
  blocks = Block.new.find_all
  weights = Matrix.build(100, 100) { 0 }

  blocks.each do |block|
    n = block['data'].size + 1
    data = block['data'].scan(/-*\d/)
    input_x = Matrix[data].map { |el| el.to_i }.t

    weights += input_x * input_x.t
  end

  weights = weights.to_a

  weights.size.times do |i|
    weights[i][i] = 0
  end

  Weights.new.change_weights(weights)
end

def recognize(data)
  session[:async] = 0 unless session[:async]
  async = session[:async]

  weights = Matrix.rows(Weights.new.find_one['data'].slice(async * 10, 10))
  x = Matrix[data.map { |el| el.to_i }.flatten]

  answer = activation(x * weights.t)
  session[:async] = inc_async(async)

  array = answer.to_a.flatten
  data = x.to_a.flatten.map.with_index do |el, index|
    (async * 10...async * 10 + 10) === index ? array.shift : el
  end

  {
      data: data.join(''),
      async: session[:async]
  }.to_json
end

def inc_async(async)
  async < 10 ? async + 1 : 0
end

def activation(vector)
  vector.map { |element| element >= 0 ? 1 : -1 }
end
