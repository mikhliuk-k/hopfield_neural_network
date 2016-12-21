require 'matrix'
require_relative 'block'

class Weights

  def initialize(options = {})
    @client = options[:client] ? options[:client] : Mongo::Client.new(["127.0.0.1:27017"], database: "block")
  end

  def change_weights(weights_data)
    @client[:weights].find.replace_one(:data => weights_data)
  end

  def find_one
    @client[:weights].find.first
  end

end
